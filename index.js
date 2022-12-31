// modulos externos 
import inquirer from 'inquirer'
import chalk from 'chalk'
import fs, { existsSync } from 'fs'
import { parse } from 'path'

operation()

function operation() {
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: [
                'Criar Conta',
                'Consultar Saldo',
                'Depositar',
                'Sacar',
                'Transferir',
                'Sair',
            ],
        },
    ])
    .then((answer) => {
        const action = answer['action']

        if(action === 'Criar Conta') {
            creatAccount()
        } else if(action === 'Depositar') {
            deposit()
        } else if(action === 'Consultar Saldo') {
            getAccountBalance()
        } else if(action === 'Sacar') {
            withdraw()
        } else if(action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit
        } else if(action === 'Transferir') {
            transfer() 
        }
    })
    .catch((err) => console.log(err))
} 

// create an accont
function creatAccount() {
    console.log(chalk.bgGreen.black('Obrigado por escolher nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))

    buildAccount()
}

function buildAccount() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta:',
        },
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        console.info(accountName)

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(
                chalk.bgRed.black('Esta conta já existe, escolha outro nome!'),
                )
                buildAccount()
                return
        }

        fs.writeFileSync(
            `accounts/${accountName}.json`, 
            '{"balance": 0}', 
            function(err) {
                console.log(err)
            },
            )

            console.log(
                chalk.bgGreen.black('Parabéns, a sua conta foi criada com sucesso!!')
            )
            operation()
    })
    .catch((err) => console.log(err))
}

// add an amount to use account
function deposit() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual é o nome da sua conta?'
        },
    ])
    .then((answer) => {

        const accountName = answer['accountName']

        //verify if account exists

        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
            name: 'amount',
            message: 'Quanto você deseja depositar?',
            },
        ]).then((answer) => {

            const amount = answer['amount']

            // add an amount
            addAmount(accountName, amount)
            operation()

        }).catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
        return false
    }

    return true
   
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName)

    if  (!amount) {
        console.log(
            chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
        )
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        } 
    )
    console.log(chalk.green(`foi depositado o valor de R$${amount} na sua conta!`),
    )
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r',
    })

    return JSON.parse(accountJSON)
}

// show account balance
function getAccountBalance() {
    inquirer.prompt([
        {
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {

        const accountName = answer["accountName"]

        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(
            `Olá o saldo da sua conta é de ${accountData.balance}`,
            ),
        )
        operation()

    }).catch(err => console.log(err))
}

// withdraw an amount from user account

function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual nome da sua conta?'
        }
    ]).then((answer) => {

        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?',
            },
        ])
        .then((answer) => {
            const amount = answer['amount']

            removeAmount(accountName, amount)
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err)) 
}

function removeAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(
            chalk.bgRed.black('Ocorreu um erro tente novamente mais tarde!'),
        )
        return withdraw()
    }

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }, 
    )

    console.log(
        chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`),
    )
    operation()
}

function transfer(amount) {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'qual nome da sua conta?'
        }
    ]).then((answer) => { 

    const accountName = answer['accountName']

        //verify if account exists

        if(!checkAccount(accountName)) {
            return transfer()
        }

        inquirer.prompt([
            {
                name:'amount',
                message:'Quanto deseja transferir?'
            }
        ]).then((answer) => {

            const amount = answer['amount']

            sendAmount(accountName, amount)

            inquirer.prompt([
                {
                    name: 'accountName',
                    message: 'Para quem deseja transferir?'
                }
            ]).then((answer) => {
                const accountName = answer['accountName']
    
                if(!checkAccount(accountName)) {
                    return transfer()
                }

                receiveAmount(accountName, amount)
            
            })
        })
        .catch((err) => console.log(err))

    }).catch((err) => console.log(err))

} 

function sendAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {

        console.log(
            chalk.bgRed.black('Ocorreu um erro, tente novamente'),
            )
        return transfer()
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor Indisponível, consulte seu saldo!!'))
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }
    )
}

function receiveAmount (accountName, amount) {
    const accountData = getAccount(accountName)
    
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
        console.log(err)
        }
    )
        console.log(chalk.bgGreen.black(
            `Transferência de R$${amount} para conta ${accountName}, foi realizada com sucesso!`))
            return operation()
}