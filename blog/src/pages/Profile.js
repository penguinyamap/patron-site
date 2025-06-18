import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userRepository } from '../repositories/userRepository';

function Profile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("userId from URL params:", userId);  // ← ここ追加
      const fetchedUser = await userRepository.findById(userId); // 例: API呼び出し
      console.log("fetched user:", fetchedUser); 
      setUser(fetchedUser);
    };
    fetchUser();
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto mt-6 p-4">
      <h1 className="text-2xl font-bold mb-4">{user.userName} さんのプロフィール</h1>
      <p>ユーザーID: {user.id}</p>
      {/* 必要に応じて他の情報も表示 */}
    </div>
  );
}

export default Profile;
