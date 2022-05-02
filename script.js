'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

///////////////////////////////////////

class App {
  #data;
  constructor() {
    btn.addEventListener('click', this.getCountryName.bind(this));
  }

  getPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async getCountryName() {
    try {
      const position = await this.getPosition();
      if (!position) throw new Error('Position not recognised');
      const { latitude: lat, longitude: lng } = position.coords;
      const response = await fetch(
        `https://geocode.xyz/${lat},${lng}?geoit=json`
      );
      console.log(response);
      const data = await response.json();
      this.setCountry(data.prov);
    } catch (err) {
      console.error('💥💥💥' + err);
      this.renderErrorMessage(err.message);
    }
  }

  setCountry(country) {
    countriesContainer.textContent = '';
    this.fetchData(`https://restcountries.com/v3.1/alpha?codes=${country}`)
      .then(this._renderMarkup.bind(this, false))
      .then(() => {
        const neighbour = this.#data.borders?.[0];
        if (!neighbour)
          throw new Error("This country hasn't got any neighbours");
        return this.fetchData(
          `https://restcountries.com/v3.1/alpha/${neighbour}`
        );
      })
      .then(this._renderMarkup.bind(this))
      .catch(err => {
        throw err;
      })
      .finally(() => (countriesContainer.style.opacity = 1));
  }

  async fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fail to get data from server');
    this.#data = (await response.json())[0];
  }

  _renderMarkup(neighbour = 'neighbour') {
    console.log(this.#data);
    const markup = `
    <article class="country ${neighbour || ''}">
          <img class="country__img" src="${this.#data.flags.svg}" />
          <div class="country__data">
            <h3 class="country__name">${this.#data.name.common}</h3>
            <h4 class="country__region">${this.#data.region}</h4>
            <p class="country__row"><span>👫</span>${(
              this.#data.population / 1000000
            ).toFixed(1)} million</p>
            <p class="country__row"><span>🗣️</span>${
              Object.values(this.#data.languages)[0]
            }</p>
            <p class="country__row"><span>💰</span>${
              Object.keys(this.#data.currencies)[0]
            }</p>
          </div>
        </article>
    `;
    countriesContainer.insertAdjacentHTML('beforeend', markup);
  }

  renderErrorMessage(msg) {
    countriesContainer.insertAdjacentHTML(
      'beforeend',
      `<span class="error">${msg}</span>`
    );
  }
}
const app = new App();

// const wait = function (s) {
//   return new Promise((_, reject) => {
//     setTimeout(() => reject(`request too long, exceeds: ${s} s`), s * 1000);
//   });
// };
// // Promise.[all, race, any, allSettled]
// const promise = Promise.race([
//   fetch(`https://restcountries.com/v3.1/name/china`),
//   wait(10),
// ]);

// promise.then(res => console.log(res)).catch(err => console.log(err));
