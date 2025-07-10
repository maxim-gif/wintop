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
  const [previousData, setPreviousData] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [status, setStatus] = useState('block');
  const [firstLoad, setFirstLoad] = useState(true);
  


  
  
  // const sumRef = useRef([0,0,0,0])

  const [sum, setSum] = useState(0);
  const prevSumRef = useRef(0);
 


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

  // useEffect(() => {
  //     console.log(sum);
  //     console.log(prevSumRef.current);
  //     if (sum > prevSumRef.current) {
  //       let nameCurse
  //       if (userData !== null) {
  //         console.log(userData);
  //         console.log(previousData);
  //        if (previousData === null) {
  //         nameCurse = userData[userData.length-1].name
  //        } else {
  //         if (previousData.length === userData.length) {
  //           for (let index = 0; index < userData.length; index++) {
  //             if (userData[index].totalCounter > previousData[index].totalCounter) {
  //               nameCurse = userData[index].name
  //             }
  //           }
  //          } else {
  //           nameCurse = userData[userData.length-1].name
  //          }
  //        }

  //        setPreviousData(userData)
  //       }
  //         // audioRef.current.play()
  //         if (nameCurse !== undefined) {
  //           const utterance = new SpeechSynthesisUtterance(`Вам добавлено проклятие ${nameCurse}`);
  //           utterance.lang = 'ru-RU';
  //           window.speechSynthesis.cancel();
  //           window.speechSynthesis.speak(utterance);
  //         }
          
          
  //     }
  //     prevSumRef.current = sum;
  // }, [sum]);


  const prevUserDataRef = useRef(null); // Хранит предыдущие данные

useEffect(() => {
  if (sum > prevSumRef.current) {
    let nameCurse;
    if (userData !== null) {
      if (prevUserDataRef.current === null) {
        nameCurse = userData[userData.length - 1].name;
      } else {
        if (userData.length === prevUserDataRef.current.length) {
          for (let index = 0; index < userData.length; index++) {
            if (
              userData[index].totalCounter >
              prevUserDataRef.current[index].totalCounter
            ) {
              nameCurse = userData[index].name;
              break;
            }
          }
        } else {
          nameCurse = userData[userData.length - 1].name;
        }
      }
    }

    // Обновляем ref с текущими данными
    prevUserDataRef.current = [...userData];

    if (nameCurse !== undefined) {
      window.speechSynthesis.cancel(); // Отменяем предыдущее произнесение
      setTimeout(() => { // Даем время на отмену
        const utterance = new SpeechSynthesisUtterance(
          `Вам добавлено проклятие ${nameCurse}`
        );
        utterance.lang = 'ru-RU';
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  }
  prevSumRef.current = sum;
}, [sum]);


  const selectUser = async(index) => {
    setSelectedName(index)
    const response = await fetch(
      `https://table-d13fe-default-rtdb.firebaseio.com/participantData.json`
    );
    const data = await response.json();
    if (data !== null && data[index] !== undefined) {
      setPreviousData(data[index].curses)
    }
  }


  useEffect(() => {
    if (selectedName !== null) {
      const db = getDatabase(app);
      const dataRef = ref(db, `participantData/${selectedName}/curses`);
      const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data)
      if (data !== null) {
        const sum = data.reduce((accumulator, curse) => {
          return accumulator + (curse.totalCounter - curse.completedCounter);
        }, 0);
        setSum(sum)
      }

    });
   
    return () => unsubscribe();
    } else {

    }
   
}, [selectedName]);



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
          <span key={index}>{item.name} - {item.totalCounter-item.completedCounter}</span>
        ))}
        </div>}
        {selectedName !== null &&<button className="blockButton" onClick={handleDisableWindow} style={{display:"none"}}>Зафиксировать на месте</button>}
      </header>
    </div>
  );
}

export default App;