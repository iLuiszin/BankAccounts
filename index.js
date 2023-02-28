// modulos externos
const inquirer = require("inquirer");
const chalk = require("chalk");

// modulos internos
const fs = require("fs");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar Saldo",
          "Depositar",
          "Transferencia entre contas",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      if (action === "Criar conta") {
        createAccount();
      } else if (action === "Consultar Saldo") {
        getAccountBalance();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Transferencia entre contas") {
        accountTransference();
      } else if (action === "Sacar") {
        widthdraw();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

// create an account
function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      console.info(answer["accountName"]);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (!accountName) {
        console.log(chalk.red("O nome da conta não pode estar vazio"));
        buildAccount();
        return;
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Esta conta já existe, escolha outro nome!")
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0 }',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green("Parabéns, a sua conta foi criada!"));
      operation();
    })
    .catch((err) => console.log(err));
}

// add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          //add an amount
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black(`Esta conta não existe, escolha outro nome!`)
    );
    return false;
  }

  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(chalk.green(`Foi depositado R$${amount} na sua conta!`));
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf-8",
    flag: "r",
  });

  return JSON.parse(accountJSON);
}

//show account balance

function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      //verify if account exists
      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }
      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$${accountData.balance}!`
        )
      );
      operation();
    })
    .catch((err) => console.log(err));
}

function widthdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return widthdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          //remove an amount
          removeAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return widthdraw();
  }

  if (amount <= accountData.balance) {
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

    fs.writeFileSync(
      `accounts/${accountName}.json`,
      JSON.stringify(accountData),
      function (err) {
        console.log(err);
      }
    );

    console.log(chalk.green(`Você sacou R$${amount} da sua conta!`));
    operation();
  } else {
    console.log(
      chalk.bgRed.black(
        "O valor que você digitou é maior que o saldo atual da conta, por favor tente outro valor."
      )
    );
    return widthdraw();
  }
}

function accountTransference() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return accountTransference();
      }

      inquirer
        .prompt([
          {
            name: "accountTransfer",
            message: "Qual o nome da conta para qual você deseja transferir?",
          },
        ])
        .then((answer) => {
          const accountTransfer = answer["accountTransfer"];

          //remove an amount
          if (!checkAccount(accountTransfer)) {
            return accountTransference();
          }

          inquirer
            .prompt([
              {
                name: "amount",
                message: "Quanto você deseja transferir?",
              },
            ])
            .then((answer) => {
              const amount = answer["amount"];

              //remove an amount
              removeAmountTransfer(accountName, amount);
              addAmountTransfer(accountTransfer, amount);
              const accountData = getAccount(accountName);

              console.log(
                `Você transferiu R$ ${amount} para ${accountTransfer}, seu saldo atual é de R$ ${accountData.balance}`
              );

              operation();
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAmountTransfer(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return accountTransference();
  }

  if (amount <= accountData.balance) {
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

    fs.writeFileSync(
      `accounts/${accountName}.json`,
      JSON.stringify(accountData),
      function (err) {
        console.log(err);
      }
    );
  } else {
    console.log(
      chalk.bgRed.black(
        "O valor que você digitou é maior que o saldo atual da conta, por favor tente outro valor."
      )
    );
    return accountTransference();
  }
}

function addAmountTransfer(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return accountTransference();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );
}
