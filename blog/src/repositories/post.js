import { supabase } from '../lib/supabase';

export const postRepository = {
  // ... (既存の関数: find, delete, update など)

  // 新規投稿作成関数
  // content: 投稿内容 (string)
  // userId: 投稿ユーザーID (string)
  // mediaFiles: アップロードするFileオブジェクトの配列 (File[]) -- ★ここが新しく追加
  create: async (content, userId, mediaFiles = []) => { // mediaFiles を引数に追加
    let mediaData = []; // データベースに保存するメディア情報の配列

    // 1. ファイルをSupabase Storageにアップロード
    for (const file of mediaFiles) {
      // UUIDを生成してファイル名とする (または既存の UUID 生成ロジックを使用)
      // Supabase Storageは自動的にUUIDをファイル名に使うことが多いですが、ここでは明示的に。
      const fileExtension = file.name.split('.').pop();
      const fileNameInStorage = `${crypto.randomUUID()}.${fileExtension}`; // UUIDの生成

      const { data, error } = await supabase.storage
        .from('posts') // ここはあなたのSupabase Storageのバケット名に合わせてください
        .upload(fileNameInStorage, file, {
          cacheControl: '3600',
          upsert: false // 同じファイル名があった場合に上書きするかどうか
        });

      if (error) {
        console.error('File upload error:', error);
        // エラーハンドリング: アップロード失敗をユーザーに通知するなど
        throw new Error('ファイルのアップロードに失敗しました: ' + error.message);
      }

      // アップロードされたファイルの公開URLを取得
      const { data: publicUrlData } = supabase.storage
        .from('posts')
        .getPublicUrl(fileNameInStorage);

      if (publicUrlData) {
        mediaData.push({
          url: publicUrlData.publicUrl,
          fileName: file.name, // 元のファイル名を保存
          type: file.type // ファイルのMIMEタイプも保存しておくと便利
        });
      }
    }

    // 2. 投稿データをデータベースに保存
    const { data, error } = await supabase
      .from('posts')
      .insert({
        content: content,
        user_id: userId, // Supabaseではuser_idのようにsnake_caseが一般的
        media: mediaData // 新しいmediaカラムにJSONB配列として保存
      })
      .select('*') // 挿入した行全体（userNameなどがあればそれも含む）を返す
      .single(); // 単一の行を返す場合

    if (error) {
      console.error('Post creation error:', error);
      throw new Error('投稿の作成に失敗しました: ' + error.message);
    }

    // ★重要: ここで、DBから返ってきたデータにuserNameがない場合、
    // フロントエンドに返すオブジェクトにcurrentUserのuserNameを付与する
    // これは、DBがuserNameを自動的にJOINして返さない場合のフォールバック
    // 通常はDB側でJOINして返すようにするのがベストプラクティス
    // （例: PostgresのFunctionやViewを使う）

    // ここはSupabaseの `select('*')` が返す内容に依存します。
    // もしDB側でuser_idからuser_nameを結合して返せるなら、この処理は不要です。
    // 便宜上、userIdとuserNameを付与して返します。
    // SupabaseのRDB連携（Postgres Functionsなど）でuserNameを返す設定を推奨
    return {
      id: data.id,
      content: data.content,
      userId: data.user_id, // frontendに合わせてcamelCaseに変換
      // 注意: DBがuserNameを返さない場合、ここではuserIdから解決できません。
      // fetchPostsと同様に、userNameはDB側で返すか、
      // フロントエンドで解決するロジックが必要になります。
      // ここでは、新しい投稿なので、フロントエンドのcurrentUserから取得したuserNameを付与します。
      userName: null, // これは後でHome.jsxでcurrentUser.userNameで上書きされる
      media: data.media // mediaカラムのデータをそのまま渡す
    };
  },

  // 投稿取得関数
  find: async (page, limit) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // ★修正: mediaカラムのデータを取得。
    // そして、user_idからusersテーブルのuser_nameをJOINして取得するようにする
    // Supabaseのselectはネストされたオブジェクトの選択に対応しています
    const { data, error } = await supabase
      .from('posts')
      .select('*, users(*)')
      .order('created_at', { ascending: false }) // 新しい投稿が先頭に来るように
      .range(from, to);

    if (error) {
      console.error('Fetch posts error:', error);
      throw new Error('投稿の取得に失敗しました: ' + error.message);
    }

    // データをフロントエンドの形式に整形
    // user_name を userName に、media を media に変換
    return data.map(post => ({
      id: post.id,
      content: post.content,
      userId: post.user_id,
      userName: post.users ? post.users.user_name : '不明なユーザー', // usersが存在しない場合のフォールバック
      // mediaカラムがオブジェクトの配列として保存されていると仮定
      media: post.media || [] // mediaカラムがnullの場合に備えて空配列
    }));
  }
};