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
  
  
  const sumRef = useRef([0,0,0,0])

  


  // Проверяем, поддерживает ли браузер уведомления
if ("Notification" in window) {
  // Запрашиваем разрешение на уведомления
  Notification.requestPermission().then(function(permission) {
      if (permission === "granted") {
          // Разрешение получено, можно отправлять уведомления
          console.log("Разрешение на уведомления получено.");
      } else if (permission === "denied") {
          // Разрешение отклонено
          console.log("Разрешение на уведомления отклонено.");
      } else {
          // Пользователь закрыл диалог, не выбрав ни одно из вариантов
          console.log("Пользователь не выбрал вариант.");
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
    const db = getDatabase(app);
    const dataRef = ref(db, 'participantData/');
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data)
      for (let index = 0; index < 4; index++) {
        if (data !== null && data[index]) {

          const sort = [...new Set(data[index].uncompletedCursesList)]

          const getIndex = (name) => {
            const index = sort.indexOf(name);
            return index === -1 ? Infinity : index;
          }
          if (data[index].curses !== undefined) {
            data[index].curses.sort((a, b) => getIndex(a.name) - getIndex(b.name));
            data[index].curses.sort(function(a, b) {
              return a.general === b.general ? 0 : a.general ? -1 : 1;
            });
            data[index].curses.sort(function(a, b) {
              if (a.completedCounter === a.totalCounter && b.completedCounter !== b.totalCounter) {
                return 1;
              } else if (a.completedCounter !== a.totalCounter && b.completedCounter === b.totalCounter) {
                return -1;
              } else {
                return 0;
              }
            })
          }

          let sum = [0,0,0,0];
          if (data[index].curses) {
            data[index].curses.forEach((item) => {
              sum[index] += item.totalCounter;
            });
          } else {
            sum[index] = -1
          }


          if (sum[index] > sumRef.current[index]) {
            if (sumRef.current[index] !== 0) {

              if (index === selectedName) {
                console.log(data[index].curses);
                const list = data[index].uncompletedCursesList
                const name = list[list.length-1];
                const curse = data[index].curses.find((item) => item.name === name )
               // eslint-disable-next-line no-unused-vars
               const not = new Notification(`Добавлено новое проклятие - ${name}`, {
                  title: "mi",
                  body: curse.title,
                  icon: 'https://tab-jet.vercel.app/static/media/logoBig.433cf0ad02a6efb20947.png'
                });
                // setTimeout(() => {
                //   not.close();
                // }, 1500);
                playAudio()
              }
            }
          }
          sumRef.current[index] = sum[index]
        } 
      }
    });

    return () => unsubscribe();
  }, [selectedName]);

  useEffect(() => {
    handleGetData()
  }, []);

  useEffect(() => {
    console.log(selectedName);
  }, [selectedName]);

  const selectUser = (index) => {
    setSelectedName(index)
    console.log(userData);
    if (userData !== null) {
      console.log(userData[index].curses);
    }
    
  }

  

  const handleDisableWindow = () => {
    window.electron.ipcRenderer.send('disable-main-window');
    setStatus("none")
  };

  const audioRef = useRef(null);
  
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play(); // Запускаем воспроизведение
    }
  };

  return (
    <div className="App">
      <header className="App-header">
      <audio ref={audioRef} src="/curse.mp3" autoplay></audio>
        {selectedName === null && <span>Выберите участника</span>}
        {adminData && adminData.listMember && adminData.listMember.length > 0 && selectedName === null &&(
          <>
            <button onClick={() => selectUser(0)} style={{border: selectedName === 0 ?"2px solid #751a79":null, borderRadius:selectedName === 0 ?"10px":null}}>{adminData.listMember[0]}</button>
            <button onClick={() => selectUser(1)} style={{border: selectedName === 1 ?"2px solid #751a79":null, borderRadius:selectedName === 1 ?"10px":null}}>{adminData.listMember[1]}</button>
            <button onClick={() => selectUser(2)} style={{border: selectedName === 2 ?"2px solid #751a79":null, borderRadius:selectedName === 2 ?"10px":null}}>{adminData.listMember[2]}</button>
            <button onClick={() => selectUser(3)} style={{border: selectedName === 3 ?"2px solid #751a79":null, borderRadius:selectedName === 3 ?"10px":null}}>{adminData.listMember[3]}</button>
          </>
        )}
        {selectedName !== null && userData !== null && userData[selectedName]?.curses && <div className="listCurse">
        {userData[selectedName].curses.filter(item => item.completedCounter !== item.totalCounter).map((item,index) => (
          <span key={index}>{item.name}</span>
        ))}
        </div>}
        {selectedName !== null &&<button className="blockButton" onClick={handleDisableWindow} style={{display:"none"}}>Зафиксировать на месте</button>}
      </header>
    </div>
  );
}

export default App;