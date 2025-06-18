import { useContext } from 'react';
import { Link } from 'react-router-dom'; 
import { SessionContext } from "../SessionProvider";

export function Post(props) {
  const { currentUser } = useContext(SessionContext);
  const { post, isEditing, editedContent, setEditedContent } = props;

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">
        by{' '}
        <Link
          //profileへの遷移リンクがあったとこ　to={`/profile/${post.userId}`}
          className="text-blue-600 hover:underline"
        >
          {post.userName}
        </Link>
      </h3>
      {isEditing ? (
        <>
          <textarea
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="flex space-x-4">
            <button
              onClick={props.onSave}
              className="text-green-600 hover:underline focus:outline-none"
            >
              保存
            </button>
            <button
              onClick={props.onCancel}
              className="text-gray-500 hover:underline focus:outline-none"
            >
              キャンセル
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-700">{post.content}</p>
          {currentUser.id === post.userId && (
            <div className="mt-2 flex space-x-4">
              <button
                onClick={props.onEdit}
                className="text-sky-500 hover:underline focus:outline-none"
              >
                編集
              </button>
              <button
                onClick={() => props.onDelete(post.id)}
                className="text-blue-500 hover:underline focus:outline-none"
              >
                削除
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
