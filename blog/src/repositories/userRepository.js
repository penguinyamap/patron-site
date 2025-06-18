// repositories/user.js
import { supabase } from '../lib/supabase';

export const userRepository = {
  async findById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error != null) {
    console.error('Supabase error detail:', error);
    throw new Error('ユーザー取得に失敗');
  }
  return {
    id: data.id,
    userName: data.user_name,
  };
}
};
