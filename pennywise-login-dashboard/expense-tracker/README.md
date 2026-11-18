# Pennywise - Expense Tracker

A beginner-friendly personal finance dashboard made with HTML, CSS, and JavaScript.

## Features
- Create an account and sign in / log out
- Passwords are hashed with the browser Web Crypto API before local storage
- Separate transaction records for each account in the current browser
- Track income and expenses in Philippine pesos (PHP)
- Automatically calculate total balance, income, and expenses
- Add transactions with a description, amount, category, and date
- Filter the transaction list by income or expenses
- Delete transactions
- Save data in browser localStorage

## Run in Visual Studio Code
1. Extract the project ZIP.
2. Open the `expense-tracker` folder in Visual Studio Code.
3. Open `index.html`.
4. Right-click and choose **Open with Live Server**.

Use localhost/Live Server rather than opening the file directly, because the browser's Web Crypto API may not be available on a `file://` page.

## Important security note
This is a front-end demonstration only. Accounts and transactions are stored in browser localStorage/sessionStorage. Passwords are hashed, but this is not secure production authentication: users can inspect or modify browser storage, there is no server-side verification, and password recovery is not implemented. For a real multi-user app, connect a backend authentication provider such as Firebase Authentication or Supabase Auth and store user data in a secured database with access rules.
