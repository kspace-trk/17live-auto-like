const puppeteer = require("puppeteer");

// 定数 (後述)
const LOGIN_URL = "https://17.live/#login-modal";
const LOGIN_USER = "ログインID"; // ログインするユーザーID
const LOGIN_PASS = "パスワード"; // ログインするユーザーIDのパスワード
const TARGET_URL = "https://17.live/live/xxxxxx"; //いいねしたい人のライブのURL
const LOGIN_USER_SELECTOR = "input[name=openID]";
const LOGIN_PASS_SELECTOR = "input[type=password]";
const LOGIN_SUBMIT_SELECTOR = "button[type=submit]";
const LIKE_BUTTON = "button[class=.crYHXF]";
const min = 1;
const max = 2;
let rand = 1; //min~maxの間のランダムな少数の間隔でクリック

(async () => {
  const browser = await puppeteer.launch({
    // ブラウザを開く
    headless: false, // ブラウザを表示するか
  });
  const page = await browser.newPage(); // 新規ページ
  await page.setViewport({ width: 1200, height: 900 });
  await page.setExtraHTTPHeaders({
    "Accept-Language": "ja",
  });
  // ログイン画面でログイン
  await Promise.all([page.waitForNavigation(), await page.goto(LOGIN_URL)]);
  await page.waitFor(10000); //一応1秒待つ
  await page.type(LOGIN_USER_SELECTOR, LOGIN_USER); // ユーザー名入力
  await page.type(LOGIN_PASS_SELECTOR, LOGIN_PASS); // パスワード入力
  await Promise.all([
    // ログインボタンクリック
    page.waitForNavigation(),
    page.click(LOGIN_SUBMIT_SELECTOR),
  ]);
  // ログイン後の画面に移動
  await Promise.all([page.waitForNavigation(), await page.goto(TARGET_URL)]);
  await page.waitFor(5000); //一応5秒待つ
  for (;;) {
    await page.click(".LikeButton__LikeButtonWrapper-ezJxxR");
    rand = Math.random() * (max - min) + min;
    await page.waitFor(rand + 1000);
  }
  // ブラウザを閉じる
  //await browser.close();
})().catch((e) => console.error(e));
