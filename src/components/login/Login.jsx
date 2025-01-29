import { useState } from "react";
import "./login.css";
import { toast, ToastContainer } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore"
import upload from "../../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });

  const [loading, setLoading] = useState(false)

  const handleAvatar = e => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try {
      // ลงทะเบียนผู้ใช้
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // อัปโหลดรูปประจำตัวของผู้ใช้
      const imgUrl = await upload(avatar.file);
      // บันทึกข้อมูลผู้ใช้ลงใน Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,  // เก็บ URL ของรูปภาพที่อัปโหลด
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      // ล็อกอินผู้ใช้
      const res = await signInWithEmailAndPassword(auth, email, password);

      // ดึงข้อมูลผู้ใช้จาก Firestore โดยใช้ userId (uid)
      const userDoc = await getDoc(doc(db, "users", res.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Logged in as:", userData.username);
        console.log("Avatar URL:", userData.avatar);

        // กำหนด avatar และข้อมูลผู้ใช้ให้ถูกต้อง
        setAvatar({ file: null, url: userData.avatar });
      } else {
        console.error("No such user!");
        toast.error("User not found. Please register.");
      }

    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='login'>
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account,</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
            Upload an image</label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>

  );
}

export default Login