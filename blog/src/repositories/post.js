import { supabase } from '../lib/supabase';

export const postRepository = {
  async create(content, userId) {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ content, user_id: userId }])
      .select();

    if (error != null) throw new Error(error.message);
    return data[0];
  },

  async find(page, limit) {
    page = isNaN(page) || page < 1 ? 1 : page;
    const start = limit * (page - 1);
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from('posts_view')
      .select('*')
      .range(start, end)
      .order('created_at', { ascending: false });

    if (error != null) throw new Error(error.message);

    return data.map((post) => {
      return {
        ...post,
        userId: post.user_id,
        userName: post.user_metadata.name,
      };
    });
  },

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
