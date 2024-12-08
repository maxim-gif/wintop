import './App.css';
import { useEffect, useState, useRef } from "react";
import { getAdminData, } from './api';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyCqv9KvlyVN94mXloU1OzlMyvAgOBWUvWk",
  authDomain: "table-d13fe.firebaseapp.com",
  projectId: "table-d13fe",
  storageBucket: "table-d13fe.appspot.com",
  messagingSenderId: "251923195524",
  appId: "1:251923195524:web:65422f17335eaab459c4d1",
  measurementId: "G-6EQEBZBJXQ",
};

const app = initializeApp(firebaseConfig);

function App() {

  const [adminData, setAdminData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [status, setStatus] = useState('block');
  const [st, setSt] = useState(true);

  
  
  // const sumRef = useRef([0,0,0,0])

  const [sum, setSum] = useState(-1);
  const prevSumRef = useRef(-1);



if ("Notification" in window) {
  // Запрашиваем разрешение на уведомления
  Notification.requestPermission().then(function(permission) {
      if (permission === "granted") {
          // Разрешение получено, можно отправлять уведомления
    
      } else if (permission === "denied") {
          // Разрешение отклонено
      
      } else {
          // Пользователь закрыл диалог, не выбрав ни одно из вариантов
 
      }
  });

  
} else {
  console.log("Ваш браузер не поддерживает уведомления.");
}
 
  const handleGetData = async() => {
    const fetchedAdminData = await getAdminData();
    setAdminData(fetchedAdminData);
  };


  useEffect(() => {
    handleGetData()
  }, []);

  useEffect(() => {
      if (sum > prevSumRef.current) {
        console.log('Sum увеличилось:', sum);
        console.log(st);
        
          // audioRef.current.play()
          const utterance = new SpeechSynthesisUtterance("Вам добавлено проклятие Отпечатки");
          utterance.lang = 'ru-RU';
          window.speechSynthesis.speak(utterance);
      }
      prevSumRef.current = sum;

  }, [sum]);

  const selectUser = (index) => {
    setSelectedName(index)
    const db = getDatabase(app);
    const dataRef = ref(db, `participantData/${index}/curses`);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      // console.log(data);
      setUserData(data)
      if (data !== null) {
        const sum = data.reduce((accumulator, curse) => {
          return accumulator + (curse.totalCounter - curse.completedCounter);
        }, 0);
        setSum(sum)
      }

    });
    
    return () => unsubscribe();
  }


  const handleDisableWindow = () => {
    window.electron.ipcRenderer.send('disable-main-window');
    setStatus("none")
  };

  const audioRef = useRef(null);
  


  return (
    <div className="App">
      <header className="App-header">
      <audio ref={audioRef} src="/curse.mp3"></audio>
        {selectedName === null && <span>Выберите участника</span>}
        {adminData && adminData.listMember && adminData.listMember.length > 0 && selectedName === null &&(
          <>
            <button onClick={() => selectUser(0)} style={{border: selectedName === 0 ?"2px solid #751a79":null, borderRadius:selectedName === 0 ?"10px":null}}>{adminData.listMember[0]}</button>
            <button onClick={() => selectUser(1)} style={{border: selectedName === 1 ?"2px solid #751a79":null, borderRadius:selectedName === 1 ?"10px":null}}>{adminData.listMember[1]}</button>
            <button onClick={() => selectUser(2)} style={{border: selectedName === 2 ?"2px solid #751a79":null, borderRadius:selectedName === 2 ?"10px":null}}>{adminData.listMember[2]}</button>
            <button onClick={() => selectUser(3)} style={{border: selectedName === 3 ?"2px solid #751a79":null, borderRadius:selectedName === 3 ?"10px":null}}>{adminData.listMember[3]}</button>
          </>
        )}
        {selectedName !== null && userData !== null && <div className="listCurse">
        {userData.filter(item => item.completedCounter !== item.totalCounter).map((item,index) => (
          <span key={index}>{item.name}</span>
        ))}
        </div>}
        {selectedName !== null &&<button className="blockButton" onClick={handleDisableWindow} style={{display:"none"}}>Зафиксировать на месте</button>}
      </header>
    </div>
  );
}

export default App;