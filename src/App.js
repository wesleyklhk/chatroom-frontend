import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/MyFirstChatroom.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  // const [msg2send, setMsg2Send] = useState("");
  const [messages, setMessages] = useState([]);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [inputValue, setInputValue] = useState({ msg2send: ""});
  const [error, setError] = useState(null);


  const contractAddress = '0x57d5AE9966ce94792420a1fED9003d62d925B6b0';
  const contractABI = abi.abi;

  function PreviousMessage(props){
    return (<tr><td style={{textAlign: 'left'}} >{props.left}</td><td style={{textAlign: 'right'}} >{props.right}</td></tr>);

  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
        getAllMessages();
      } else {
        setError("Please install a MetaMask wallet to use our chatroom.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }


  const sendMessageHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const chatroomContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsSending(true);
        const newmsg = await chatroomContract.publishMessage(inputValue.msg2send);
        console.log("Sending message...");
        await newmsg.wait();
        console.log("Message is sent", newmsg);
        setInputValue({msg2send:""});
        getAllMessages();
        setIsSending(false);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllMessages = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const chatroomContract = new ethers.Contract(contractAddress, contractABI, signer);
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });


        let allmsgs = await chatroomContract.getAllMessages();
        allmsgs = allmsgs.map((x,i)=>{
          let res = {isMe:false,id:i};
          if (x.authorAddress.toLowerCase() === account.toLowerCase()) {
            res.left = x.post;
            res.right = "";
          }else{
            res.left = "";
            res.right = x.post;            
          }
          return res;
        })
        setMessages(allmsgs);
        


      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our chatroom.");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ [event.target.name]: event.target.value }));
  }  

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllMessages();
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Chatroom Dapp</span> 💰</h2>
      <table>
        <tbody>
          {messages.map((msg) => <PreviousMessage key={msg.id} left={msg.left} right={msg.right} />)}
        </tbody>
      </table>




      <section className="customer-section px-10 pt-5 pb-10">
        {
          isSending?<div className="loader"></div>:
            <div className="mt-7 mb-9">
            <form className="form-style">
              <input
                type="text"
                className="input-style"
                onChange={handleInputChange}
                name="msg2send"
                placeholder="Your Message"
                value={inputValue.msg2send}
              />
              <button
                className="btn-purple"
                onClick={sendMessageHandler}>Send</button>
            </form>
          </div>
        }
        
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
    </main>
  );
}
export default App;
