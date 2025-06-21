// repositories/user.js
import { supabase } from '../lib/supabase';

export const userRepository = {
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

      console.log("idです",id,typeof(id))

    // 🔽 このログが出ていないと原因がつかめません
    console.log('🧪 findById debug log:', {
      idPassedToQuery: id,
      dataReturned: data,
      errorReturned: error,
    });

    if (!data) {
      console.warn('⚠️ data is null または undefined');
    }

    if (error != null) {
      console.error('❌ Supabase error detail:', error);
      throw new Error('ユーザー取得に失敗');
    }

    return {
      id: data.id,
      userName: data.user_name,
    };
  }
};
