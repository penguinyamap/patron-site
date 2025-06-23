import { supabase } from '../lib/supabase';

export const authRepository = {
  async signup(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error != null) throw new Error(error.message);

    const user = data.user;

    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          user_name: name,
          icon_url: null,
        },
      ]);

    if (insertError != null) {
      console.error('usersテーブルへの挿入に失敗:', insertError);
      throw new Error('ユーザー登録に失敗しました');
    }

    return {
      id: user.id,
      email: user.email,
      userName: name,
    };
  },

  //追加：signin関数
  async signin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error != null) {
      throw new Error('ログインに失敗しました');
    }

    return data.user;
  },
//ログアウト機能　こいつもAIが勝手に消してるし
  async signout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};
