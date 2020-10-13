const puppeteer = require("puppeteer");

// 定数 (後述)
const LOGIN_URL = "https://pf.fisdom.org/login/index.html";
const LOGIN_USER = "keigonakao.0825@gmail.com"; // 使用したいユーザーID
const LOGIN_PASS = "Keigonakao0825"; // 使用したいユーザーIDのパスワード
const TARGET_URL = "https://pf.fisdom.org/course/mypage.html";
const LOGIN_USER_SELECTOR = "input[type=text]";
const LOGIN_PASS_SELECTOR = "input[type=password]";
const LOGIN_SUBMIT_SELECTOR = "button[id=btn01]";
const playlist = "span[id=playlist_link+]";
let playlists = 1;
let contents = 1;

/**
 * スクリーンショットのファイル名を取得します。
 * @returns YYYYMMDD-HHMMSS.png 形式の文字列
 */
function getFilename() {
  // タイムゾーンを調整して文字列化します。
  const offset = new Date().getTimezoneOffset() * 60000;
  const iso = new Date(Date.now() - offset).toISOString();
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  return `${m[1]}${m[2]}${m[3]}-${m[4]}${m[5]}${m[6]}.png`;
}

/**
 * メイン処理です。
 */
(async () => {
  const browser = await puppeteer.launch({
    // ブラウザを開く
    headless: false, // ブラウザを表示するか (デバッグの時は false にしたほうが画面が見えてわかりやすいです)
  });
  const page = await browser.newPage(); // 新規ページ
  await page.setViewport({ width: 1440, height: 900 }); // ビューポート (ウィンドウサイズ)
  await page.setExtraHTTPHeaders({
    // 必要な場合、HTTPヘッダを追加
    "Accept-Language": "ja",
  });

  // ログイン画面でログイン
  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });
  await page.waitFor(2000); //2秒待つ、この間に画面クリックしてアクティブにする
  await page.type(LOGIN_USER_SELECTOR, LOGIN_USER); // ユーザー名入力
  await page.type(LOGIN_PASS_SELECTOR, LOGIN_PASS); // パスワード入力
  await Promise.all([
    // ログインボタンクリック
    // クリック後ページ遷移後通信が完了するまで待つ (ページによっては 'domcontentloaded' 等でも可)
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click(LOGIN_SUBMIT_SELECTOR),
  ]);
  // ログイン後の画面に移動
  await page.goto(TARGET_URL);
  await page.waitFor(7000); //5秒待つ。この間に任意の講座をクリック
  const elem = await page.$x(
    "/html/body/section/div/div/div/div[2]/div[2]/ul/li[1]/div"
  );
  await elem[0].click();
  await page.waitFor(7000); //5秒待つ。この間に任意の講座をクリック
  await Promise.all([
    // クリック後ページ遷移後通信が完了するまで待つ
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    await page.click("#playlist_link01_" + playlists),
    playlists++,
  ]);
  await Promise.all([
    // クリック後ページ遷移後通信が完了するまで待つ
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("#content_link01_" + contents), //コンテンツ一覧
    contents++,
  ]);
  await page.waitFor(3000);
  ///////////////////質問文取得
  //質問数取得
  var qLength = await page.$x(
    "//*[@id='main']/div/div/div/div/div[5]/div[3]/form/div"
  ).length;
  await page.waitFor(3000);
  console.log(qLength);
  console.log("↑これundefind?");
  for (let i = 0; i < qLength; i++) {
    const q = await page.$x(
      "//*[@id='main']/div/div/div/div/div[5]/div[3]/form/div[" + i + "]/div/p"
    );
    const jsHandle = await q[0].getProperty("textContent");
    const qText = await jsHandle.jsonValue();
    console.log(qText);
  }

  // スクリーンショット (フルページ)
  const filename = getFilename();
  await page.screenshot({ path: filename, fullPage: true });
  // ブラウザを閉じる
  await browser.close();
})().catch((e) => console.error(e));
