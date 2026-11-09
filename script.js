const display = document.querySelector("#display");
const keys = document.querySelector(".keys");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let shouldStartNewValue = false;

function render() {
  display.textContent = currentValue;
}

function enterDigit(digit) {
  if (currentValue === "Error" || shouldStartNewValue) {
    currentValue = digit;
    shouldStartNewValue = false;
  } else if (currentValue === "0") {
    currentValue = digit;
  } else if (currentValue.replace(/[-.]/g, "").length < 14) {
    currentValue += digit;
  }
  render();
}

function enterDecimal() {
  if (currentValue === "Error" || shouldStartNewValue) {
    currentValue = "0.";
    shouldStartNewValue = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  render();
}

function calculate(left, right, operator) {
  switch (operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function formatResult(value) {
  if (!Number.isFinite(value)) return "Error";
  // Avoid displaying floating-point artifacts while keeping useful precision.
  return String(Number(value.toPrecision(12)));
}

function chooseOperator(operator) {
  if (currentValue === "Error") clear();

  const value = Number(currentValue);
  if (pendingOperator && !shouldStartNewValue) {
    const result = calculate(storedValue, value, pendingOperator);
    currentValue = formatResult(result);
    storedValue = currentValue === "Error" ? null : Number(currentValue);
    render();
  } else {
    storedValue = value;
  }

  pendingOperator = currentValue === "Error" ? null : operator;
  shouldStartNewValue = true;
}

function equals() {
  if (!pendingOperator || storedValue === null || currentValue === "Error") return;

  currentValue = formatResult(calculate(storedValue, Number(currentValue), pendingOperator));
  storedValue = null;
  pendingOperator = null;
  shouldStartNewValue = true;
  render();
}

function clear() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  shouldStartNewValue = false;
  render();
}

function deleteLast() {
  if (currentValue === "Error" || shouldStartNewValue) {
    currentValue = "0";
    shouldStartNewValue = false;
  } else {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
    if (currentValue === "-") currentValue = "0";
  }
  render();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) enterDigit(button.dataset.number);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action === "decimal") enterDecimal();
  else if (button.dataset.action === "equals") equals();
  else if (button.dataset.action === "clear") clear();
  else if (button.dataset.action === "delete") deleteLast();
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
  else if (event.key === ".") enterDecimal();
  else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    equals();
  } else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape" || event.key.toLowerCase() === "c") clear();
});
