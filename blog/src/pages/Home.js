import { useState, useContext, useEffect, useRef } from 'react'; // useRef を追加
import { SessionContext } from '../SessionProvider';
import { Navigate } from 'react-router-dom';
import { SideMenu } from '../components/SideMenu';
import { Post } from '../components/Post';
import { Pagination } from '../components/Pagination';
import { postRepository } from '../repositories/post.js';
import { authRepository } from '../repositories/auth';

const limit = 5;
const MAX_POST_ATTACHMENT_SIZE = 500 * 1024 * 1024; // 1ポストあたりの添付ファイルの合計最大サイズを500MBに設定

function Home() {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // 選択されたメディアファイル
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const { currentUser, setCurrentUser } = useContext(SessionContext);

  // useRef を使ってファイル入力要素への参照を作成
  const fileInputRef = useRef(null); 

  useEffect(() => {
    fetchPosts(page);
  }, []);

  const createPost = async () => {
    // 実際のアプリケーションでは、mediaFilesをFormDataなどを使ってバックエンドに送信する必要があります。
    // 現状はUI表示のための一時URLを使用
    const mediaUrls = mediaFiles.map(file => URL.createObjectURL(file)); 
    
    // 既存のテキスト投稿ロジックと結合
    const post = await postRepository.create(content, currentUser.id);

    setPosts([{ 
      ...post, 
      userId: currentUser.id, 
      userName: currentUser.userName,
      mediaUrls: mediaUrls // メディアURLを追加
    }, ...posts]);
    
    setContent('');
    setMediaFiles([]); // 投稿後、メディアファイルをリセット

    // ★追加: ファイル入力の値をクリア
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    let currentTotalSize = 0;

    const newFilesCandidate = [...mediaFiles, ...files]; 

    for (const file of newFilesCandidate) {
      currentTotalSize += file.size;
    }

    if (currentTotalSize > MAX_POST_ATTACHMENT_SIZE) {
      alert(`選択されたファイルの合計サイズが ${MAX_POST_ATTACHMENT_SIZE / (1024 * 1024)}MB を超えています。`);
      setMediaFiles([]); 
      // ★修正: ここも ref を使って値をクリアする方が確実
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setMediaFiles(newFilesCandidate);
  };

  const fetchPosts = async (page) => {
    const posts = await postRepository.find(page, limit);
    setPosts(posts);
  };

  const moveToNext = async () => {
    const nextPage = page + 1;
    await fetchPosts(nextPage);
    setPage(nextPage);
  };

  const moveToPrev = async () => {
    const prevPage = page - 1;
    await fetchPosts(prevPage);
    setPage(prevPage);
  };

  const deletePost = async (postId) => {
    await postRepository.delete(postId);
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const startEditing = (postId, currentContent) => {
    setEditingPostId(postId);
    setEditedContent(currentContent);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditedContent('');
  };

  const saveEdit = async (postId) => {
    await postRepository.update(postId, editedContent);
    setPosts(posts.map((post) =>
      post.id === postId ? { ...post, content: editedContent } : post
    ));
    cancelEditing();
  };

  const signout = async () => {
    await authRepository.signout();
    setCurrentUser(null);
  };

  if (currentUser == null) return <Navigate replace to="/signin" />;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#34D399] p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">SNS APP</h1>
          <button className="text-white hover:text-red-600" onClick={signout}>
            ログアウト
          </button>
        </div>
      </header>
      <div className="container mx-auto mt-6 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <textarea
                className="w-full p-2 mb-4 border-2 border-gray-200 rounded-md"
                placeholder="What's on your mind?"
                onChange={(e) => setContent(e.target.value)}
                value={content}
              />
              {/* ★追加: ref={fileInputRef} を設定 */}
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*,application/*,text/*"
                onChange={handleFileChange}
                ref={fileInputRef} 
                className="mb-4 block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-green-50 file:text-green-700
                           hover:file:bg-green-100"
              />
              {mediaFiles.length > 0 && (
                <div className="mb-4 p-2 border border-gray-200 rounded-md bg-gray-50">
                  <p className="font-semibold text-gray-700">選択されたファイル:</p>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {mediaFiles.map((file, index) => (
                      <li key={index}>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                  <p className="font-semibold text-gray-700 mt-2">
                    合計サイズ: {(mediaFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
              <button
                className="bg-[#34D399] text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={createPost}
                disabled={content === '' && mediaFiles.length === 0}
              >
                Post
              </button>
            </div>
            <div className="mt-4">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onDelete={deletePost}
                  onEdit={() => startEditing(post.id, post.content)}
                  onCancel={cancelEditing}
                  onSave={() => saveEdit(post.id)}
                  isEditing={editingPostId === post.id}
                  editedContent={editedContent}
                  setEditedContent={setEditedContent}
                />
              ))}
            </div>
            <Pagination
              onPrev={page > 1 ? moveToPrev : null}
              onNext={posts.length >= limit ? moveToNext : null}
            />
          </div>
          <SideMenu />
        </div>
      </div>
    </div>
  );
}

export default Home;