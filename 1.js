const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const user = {
  username: "201821110217",
  password: "Shauniloveu1027"
};
const { username, password } = user;

let loginFlag = false;

let options = new chrome.Options().addArguments("window-size=1920*3000");

(async () => {
  let browser = await new Builder().setChromeOptions(options).forBrowser("chrome").build()
    .catch(err => console.log("1", err));
  try {
    await browser.get("http://ids.zuel.edu.cn/authserver/login?service=http%3A%2F%2F202.114.234.75%2Fjsxsd%2Fframework%2FxsMain.jsp%3Bjsessionid%3D58591E596B59E4B0F583CD84BF8D9C93")
      .catch(err => console.log("1", err));
    let loginForm = await browser.findElement({ id: "casLoginForm" })
      .catch(err => console.log("2", err));
    await loginForm.findElement({ id: "username" }).sendKeys(username)
      .catch(err => console.log("3", err));
    await loginForm.findElement({ id: "password" }).sendKeys(password)
      .catch(err => console.log("4", err));
    let captchaImg = await loginForm.findElement({ id: "captchaImg" });
    if (captchaImg) {
      captchaImg.takeScreenshot().then((screenshot) => {
        console.log(screenshot);
      })
    }

    // await loginForm.findElement({ className: "auth_login_btn" }).click()
    // .catch (err => console.log("5", err));
    await browser.getTitle()
      .then((curtitle) => {
        if (curtitle == "教学一体化服务平台") {
          loginFlag = true;
        }
        console.log(loginFlag);
      })
      .catch(err => console.log(err));
  }
  catch {
    console.log("err");
  }
  finally {
    // await browser.quit();
  }
})();