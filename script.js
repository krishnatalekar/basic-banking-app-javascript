"use strict";

// Dummy data
const account1 = {
    owner: "Krishna Talekar",
    movements: [200, 300, -100, -300, 500, 700, -90, 70],
    interestRate: 1.2,
    pin: 1111,
    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2020-05-27T17:01:17.194Z',
        '2020-07-11T23:36:17.929Z',
        '2020-07-12T10:51:36.790Z',
    ],
    currency: 'USD',
    locale: 'en-US',
}

const account2 = {
    owner: "John Doe",
    movements: [-200, -300, 200, 350, -510, -740, 95, -71],
    interestRate: 1.5,
    pin: 2222,
    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
}

const accounts = [account1, account2];

// Elements Selectors
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const lableSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const constainerMovement = document.querySelector(".movement");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUserName = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUserName = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Arrow functions
const formatCurrency = (value, locale, currency) => {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency
    }).format(value);
}

const formatMovementsDate = (date, locale) => {
    const calcDayPassed = (date1, date2) =>
        Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDayPassed(new Date(), date);

    if (daysPassed === 0) return "Today";
    if (daysPassed === 1) return "Yesterday";
    if (daysPassed <= 7) return `${daysPassed} days ago`;
    else {
        return new Intl.DateTimeFormat(locale).format(date);
    }
}

const displayMovements = (acc) => {
    constainerMovement.innerHTML = "";
    const movs = acc.movements;
    movs.forEach((mov, i) => {
        const type = mov > 0 ? "deposit" : "withdrawal";

        const date = new Date(acc.movementsDates[i]);

        const dateLabel = formatMovementsDate(date, acc.locale);

        const html = `<div class="movement__row">
                        <div class="movement__type movement__type--${type}">${i + 1} ${type}</div>
                        <div class="movement__date">${dateLabel}</div>
                        <div class="movement__value">${new Intl.NumberFormat(acc.locale, {
            style: "currency",
            currency: acc.currency
        }).format(mov)}</div>
                    </div>`

        constainerMovement.insertAdjacentHTML("afterbegin", html);
    });
}

const calcDisplayBalance = (acc) => {
    acc.balance = acc.movements.reduce((ac, move) => {
        return ac + move;
    }, 0);
    labelBalance.textContent = formatCurrency(acc.balance, acc.locale, acc.currency);
}

const calcDisplaySummary = (acc) => {
    const income = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);

    labelSumIn.textContent = formatCurrency(income.toFixed(2), acc.locale, acc.currency);

    const withdrawal = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = formatCurrency(Math.abs(withdrawal).toFixed(2), acc.locale, acc.currency);

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate / 100))
        .filter((int, i) => {
            return int > 1;
        })
        .reduce((acc, int) => acc + int, 0);
    lableSumInterest.textContent = formatCurrency(interest.toFixed(2), acc.locale, acc.currency);
}

const createUserName = (accs) => {
    accs.forEach((acc) => {
        acc.username = acc.owner.toLowerCase().split(" ").map(name => name[0]).join("");
    });
}

createUserName(accounts);

const startLogoutTimer = () => {
    const tick = () => {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const seconds = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${min}:${seconds}`;
        time--;

        if (time === 0) {
            clearInterval(timer);
            labelWelcome.textContent = "Login to get started";
            containerApp.style.opacity = 0;
        }
    }

    let time = 300;
    tick();
    const timer = setInterval(tick, 1000);
}

const updateUi = (acc) => {
    displayMovements(acc);
    calcDisplayBalance(acc);
    calcDisplaySummary(acc);
}

// Event handlers
let currentAccount;

btnLogin.addEventListener("click", (e) => {
    e.preventDefault(); // To stop the page from refreshing

    currentAccount = accounts.find(acc => acc.username === inputLoginUserName.value);

    if (currentAccount?.pin === +(inputLoginPin.value)) {
        labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(" ")[0]}`;

        const dateNow = new Date();

        const options = {
            hour: "2-digit",
            minutes: "numaric",
            day: "numeric",
            month: "long",
            year: "numeric"
        }

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(dateNow);

        containerApp.style.opacity = 100;

        // Clear inputs for login form
        inputLoginUserName.value = inputLoginPin.value = "";
        startLogoutTimer();
        updateUi(currentAccount);
    }
});

btnTransfer.addEventListener("click", (e) => {
    e.preventDefault();
    const amount = +(inputTransferAmount.value);
    const recieverAccount = accounts.find(acc => acc.username === inputTransferTo.value);

    inputTransferTo.value = inputTransferAmount.value = "";

    if (amount > 0 && recieverAccount && currentAccount.balance > amount && recieverAccount.username !== currentAccount.username) {
        console.log("Transfer is valid");
        currentAccount.movements.push(-amount);
        recieverAccount.movements.push(amount);
        currentAccount.movementsDates.push(new Date().toISOString());
        recieverAccount.movementsDates.push(new Date().toISOString());

        updateUi(currentAccount);
    }
});

btnClose.addEventListener("click", (e) => {
    e.preventDefault();

    if (inputCloseUserName.value === currentAccount.username && +(inputClosePin.value) === currentAccount.pin) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);

        accounts.splice(index, 1);
        containerApp.style.opacity = 0;
    }
    inputCloseUserName.value = inputClosePin.value = "";
    labelWelcome.textContent = "Login to get started";
});

btnLoan.addEventListener("click", (e) => {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        setTimeout(() => {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            updateUi(currentAccount);
        }, 5000);
    }
    inputLoanAmount.value = "";
});