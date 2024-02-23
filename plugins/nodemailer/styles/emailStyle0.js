// /plugins/nodemailer/styles/emailStyle0.js
const emailStyle0 = `
body {
border:5px solid #9932432
  display: block;
  font-family: "minonPro";
  margin: 0;
  padding: 0;
}

a {
  color: rgb(26, 26, 164);
}

h2 {
  font-size: 1.8rem;
}

li {
  font-size: 1.2rem;
}

p {
  font-size: 1.2rem;
}

@media (min-width: 768px) {
  p {
    width: 50%;
    margin-left: -13%;
    transform: translateX(75%);
  }
}

button {
  width: 84%;
  height: 42px;
  margin: 1%;
  border-radius: 5px;
  border: 5px solid #932432;
  font-size: 1.4rem;
  color: black;
  font-family: "minonPro";
}

@media (min-width: 768px) {
  button {
    font-size: 0.5rem;
    margin: 1%;
    padding: 0;
    font-size: 1.8rem;
  }
}

`;

module.exports = emailStyle0;
