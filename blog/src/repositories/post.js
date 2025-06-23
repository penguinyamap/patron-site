import { supabase } from '../lib/supabase';

export const postRepository = {
  // 投稿作成
  create: async (content, userId, mediaFiles = []) => {
    const mediaData = [];

    for (const file of mediaFiles) {
      console.log('アップロード対象ファイル:', mediaFiles);
      const ext = file.name.split('.').pop();
      const uuid = crypto.randomUUID();
      const fileNameInStorage = `${uuid}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('posts') // ← バケット名に合わせて変更
        .upload(fileNameInStorage, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('ファイルアップロード失敗:', uploadError);
        throw new Error('ファイルのアップロードに失敗しました: ' + uploadError.message);
      }

            // 👇 publicUrlDataを取得してからログ出力する
      const { data: publicUrlData } = supabase
        .storage
        .from('posts')
        .getPublicUrl(fileNameInStorage);

      if (publicUrlData) {
        console.log('pushするmedia情報:', {
          url: publicUrlData.publicUrl,
          fileName: file.name,
          type: file.type,
        });

        mediaData.push({
          url: publicUrlData.publicUrl,
          fileName: file.name,
          type: file.type,
        });
      }
    }

    console.log('最終的なmediaData:', mediaData);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        user_id: userId,
        media: mediaData, // JSONB
      })
      .select('*')
      .single();

    if (error) {
      console.error('投稿作成エラー:', error);
      throw new Error('投稿の作成に失敗しました: ' + error.message);
    }

    return {
      id: data.id,
      content: data.content,
      userId: data.user_id,
      userName: null, // currentUser.userNameで上書き予定
      media: data.media || [],
    };
  },

  // 投稿取得
  find: async (page, limit) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('posts')
      .select('*, users(user_name)')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('投稿取得エラー:', error);
      throw new Error('投稿の取得に失敗しました: ' + error.message);
    }

    return data.map(post => ({
      id: post.id,
      content: post.content,
      userId: post.user_id,
      userName: post.users?.user_name ?? '不明なユーザー',
      media: post.media || [],
    }));
  },

  //削除と編集の機能が消えてたから追加。AI勝手に消すなよ!
  async delete(id) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error != null) throw new Error(error.message);
      return true;
    },

    async update(id, newContent) {
      const { error } = await supabase
        .from('posts')
        .update({ content: newContent })
        .eq('id', id);

      if (error != null) throw new Error(error.message);
      return true;
    },

};
