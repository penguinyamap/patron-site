/* ☆☆☆ガチャ結果リスト☆☆☆ */
const GachaList = []; // 空で初期化して、あとで埋める

// CSVを読み込んでGachaListを構築
fetch('gacha.csv')
  .then(response => response.text())
  .then(data => {
    const lines = data.trim().split('\n');
    const header = lines[0].split(',');

    // データ行のループ
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const item = cols[0];
      const weight = parseFloat(cols[1]);
      const gachaNum = parseInt(cols[2]);

      // ガチャ番号の配列がまだ存在しなければ作成
      if (!GachaList[gachaNum]) {
        GachaList[gachaNum] = [];
      }

      // アイテム追加
      GachaList[gachaNum].push({ item, weight });
    }

    console.log('GachaList loaded from CSV:', GachaList);
  })
  .catch(err => console.error('CSV読み込みエラー:', err));

/* ☆☆☆ガチャタイトル(ガチャリストと順番をそろえること)☆☆☆ */
//モーダルのタイトル部分に表示されます
const GachaTitleList = [
	"論文・レポート"
//この上に追加していく
];

/* ☆☆☆gif画像(ガチャ排出アニメーションのURLを指定する)☆☆☆ */
const gifs = [
	'odorupen.gif'
];



//モーダル関係 ※ここから下は編集しない
document.addEventListener('DOMContentLoaded', (event) => {
	let GachaNum = 0;//ガチャ番号を保存する変数
	let timer;//ガチャ結果に遷移するタイマーを保存する変数
	
	const jsModal = document.getElementById('gachaModal');
	const jamp = document.querySelector('.js-result');
	const gachaTitle = document.getElementById('gachaTitleTxt');
        const selectedGif = document.getElementById("playGif");

	//ガチャを抽選する関数
function Gacha(tempNum) {
  const pool = GachaList[tempNum];
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;
  for (let i = 0; i < pool.length; i++) {
    cumulative += pool[i].weight;
    if (rand < cumulative) {
      return pool[i].item;
    }
  }
}

	//ランダムなgifを再生する関数
	function randomGif() {
		var j = Math.floor(Math.random() * gifs.length);
		selectedGif.src = gifs[j] + '?t=' + new Date().getTime();//初めから再生されるようにtimeをつける
	}

	//ガチャがクリックされた時
	window.choiceGachaBox = function(tempNum) {
		GachaNum = tempNum;
		gachaTitle.textContent = `${GachaTitleList[GachaNum]}`;
		randomGif();
		timer = setTimeout(function() {
			window.location.href = Gacha(GachaNum);//ガチャ排出
			clearTimeout(timer);//タイマーリセット
		}, 8.5*1000);//ガチャ結果へ9秒後に遷移
		jsModal.style.display = 'block';//モーダル表示
	};

	//「結果だけ見る」ボタンがクリックされた時
	jamp.addEventListener('click', result);
	function result() {
		window.location.href = Gacha(GachaNum);//ガチャ排出
		clearTimeout(timer);//タイマーリセット
	}

	//モーダルコンテンツ以外がクリックされた時→モーダルウィンドウを閉じる
	window.addEventListener('click', outsideClose);
	function outsideClose(event){
		if (event.target === jsModal) {
			clearTimeout(timer);//タイマーリセット
			jsModal.style.display = 'none';//モーダル非表示
		}
	}
	
	//戻る・進むボタン対応
	window.addEventListener('pageshow', pageShow);
	function pageShow(event){
		jsModal.style.display = 'none';//モーダル非表示
		if (event.persisted) { //戻る・進むボタンのとき
			window.location.reload();//キャッシュ対応のための強制リロード
		}
	}
	
});