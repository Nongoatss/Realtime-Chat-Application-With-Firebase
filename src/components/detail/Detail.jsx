import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore"
import { auth, db } from "../../lib/firebase"
import { useUserStore } from "../../lib/userStore";
import "./detail.css"
import { useEffect } from "react";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, changeChat } = useChatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (!user || !currentUser) return;

    const userDocRef = doc(db, "users", currentUser.id);

    // ติดตามการเปลี่ยนแปลงแบบเรียลไทม์จาก Firestore
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      const userData = docSnapshot.data();
      if (userData) {
        const isBlocked = userData.blocked?.includes(user.id);
        if (isBlocked !== isReceiverBlocked) {
          changeBlock(); // อัพเดตสถานะบล็อคใน Zustand
        }
      }
    });

    // Cleanup function
    return () => unsubscribe();
  }, [user, currentUser, isReceiverBlocked, changeBlock]);



  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id)
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });

      changeBlock()

    } catch (err) {
      console.log(err)
    }
  };
  return (
    <div className='detail'>
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p></p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">

                <img src="https://img2.pic.in.th/pic/_6da1ff04-ccee-4038-b8e1-a0ee6d3c647c.jpg" alt="" />
                <span>photo_2024_.png</span>
              </div>
              <img src="./download.png " alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">

                <img src="https://img5.pic.in.th/file/secure-sv1/445821682_760790569504081_3579073977465029564_n.jpg" alt="" />
                <span>photo_2024_.png</span>
              </div>
              <img src="./download.png " alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">

                <img src="https://img5.pic.in.th/file/secure-sv1/_d021690b-9e58-46b7-b058-ba13e9506f87.jpg" alt="" />
                <span>photo_2024_.png</span>
              </div>
              <img src="./download.png " alt="" className="icon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
              ? "Unblock User"
              : "Block User"}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>Logout</button>

      </div>
    </div>
  )
}

export default Detail