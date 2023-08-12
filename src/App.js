import {Box , Button, Container ,HStack,VStack ,Input} from "@chakra-ui/react";
import Message from "./Components/Message.jsx"
import {signOut , onAuthStateChanged, getAuth ,GoogleAuthProvider , signInWithPopup} from "firebase/auth"
import { useState ,useEffect, useRef } from "react";
import {app} from "./firebase.js" ;
import {onSnapshot ,getFirestore ,addDoc ,collection, serverTimestamp ,query ,orderBy} from "firebase/firestore" ;
const auth = getAuth(app);
const db = getFirestore(app);


const loginHandler =()=>{
  const p = new GoogleAuthProvider();
  signInWithPopup(auth ,p);
}
const logoutHandler =()=>{
  signOut(auth);
}
function App() {
 
  const [user , setUser] = useState(false);
  const [message , setmessage] = useState("");
  const [messages , setmessages] = useState([]);
  const divForScroll =useRef(null);
 
  const submitHandler = async(e)=>{
    e.preventDefault();
    try{
      await addDoc(collection(db ,"Messages"),{
        text: message,
        uid :user.uid,
        uri :user.photoURL,
        createdAt: serverTimestamp(),
      });
      divForScroll.current.scrollIntoView({behavior:"smooth"})
      setmessage("");
    }
    catch(error){
      alert(error);
    }
  };

 
   useEffect(()=>{
    const q = query(collection(db ,"Messages"),orderBy("createdAt" ,"asc"))
    const ss = onAuthStateChanged(auth,(data)=>{
      setUser(data);
    } );
   const sus = onSnapshot(q,(snap)=>{
      setmessages(
        snap.docs.map((item)=>{
          const id =item.id;
          return {id , ...item.data()};
        })
      )
    })
    return()=>{
      ss();
      sus();
    };
   },[]);
  return (
    <Box bg ={"red.50"}>
      {
        user?(
          <Container h={"100vh"} bg ={"white"} >
    <VStack h={"full"} bg={"telegram.100"} padding={"4"} >
      <Button w={"full"} colorScheme={"blue"} padding={"0"} onClick={logoutHandler}>
        LogOut
      </Button>
      <VStack h={"full"} w={"full"} bg={"yellow.50"} margin={"0"} overflowY={"auto"} paddingY={"4"} paddingX={"4"}  >
        
        {messages.map((item)=>(
          <Message
          key={item.id}
           user={item.uid===user.uid?"me":"other"} 
           text= {item.text} 
           uri={item.uri} />
        )) }
        <div ref={divForScroll}></div>
      </VStack>
      <form onSubmit={submitHandler} style={{width : "100%"}}>
      <HStack>
      <Input value={message} onChange={(e)=>setmessage(e.target.value)} placeholder="Enter a message .:.:."/>
      <Button w={"full"} colorScheme={"purple"} type="submit">
            Send
            </Button>
       </HStack>


      </form>
      

    </VStack>

      </Container>
        ):<VStack justifyContent={"center"} h={"100vh"}>
          <Button onClick={loginHandler} colorScheme={"purple"}>
            Sign up with Google
          </Button>
        </VStack>
      }
    </Box>
  );
}

export default App;
