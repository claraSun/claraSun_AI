// src/api.js
import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://factoryd.akousist.com/v1', // 替換為Dify的API基礎URL
  baseURL: 'https://api.dify.ai/v1', // 替換為Dify的API基礎URL
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer app-EYnOFniOSmHMk1A9Moc5SJRH'
  }
});



// 取得對話歷史記錄（同案件）
export const getAllConversation = async () => {
  const user = 'goodya.tw@gmail.com'
  try {
    const response = await api.get(`/conversations?user=${user}&last_id=&limit=20`); // 替換為具體的API端點
    return response.data;
  } catch (error) {
    console.error('Error fetching all:', error);
    throw error;
  }
};

// 建一對話記錄（同案件）C
export const createChat = async (inputQuery) => {
  const user = 'goodya.tw@gmail.com';
  // const caseId = localStorage.getItem('case_id');
  const reqBody ={
    inputs: {},
    query: inputQuery,
    response_mode: "streaming",
    auto_generate: false,
    conversation_id: "",
    user: user,
    auto_generate_name: false,
  }
  try {
    const response = await api.post('/chat-messages',reqBody); // 替換為具體的API端點
   
    return response.data;
  } catch (error) {
    console.error('Error fetching single:', error);
    throw error;
  }
};

// 取得歷史記錄中的單一對話框（同案件）R
export const getSingleConversation = async (id) => {
  const user = 'goodya.tw@gmail.com'
  try {
    const response = await api.get(`/messages?user=${user}&conversation_id=${id}`); // 替換為具體的API端點
    return response.data;
  } catch (error) {
    console.error('Error fetching single:', error);
    throw error;
  }
};

// 更新對話記錄（同案件）U
export const updateSingleChat = async (val, inputQuery) => {
  // 確保 inputQuery 和 val 是字符串
  console.log('inputQuery:', inputQuery);
  console.log('conversation_id:', val);

  // 確保 reqBody 是一個簡單的物件
  const reqBody = {
    inputs: {},
    query: inputQuery, // 應該是一個簡單的字符串
    conversation_id: val, // 應該是一個簡單的字符串
    user: 'goodya.tw@gmail.com', // 應該是一個簡單的字符串
    response_mode: "streaming"
  };

  
  try {
    const response = await api.post('/chat-messages', reqBody);
    return response.data;
  } catch (error) {
    console.error('Error updating single chat:', error);
    throw error;
  }
};


// 刪除對話記錄（同案件）D
export const deleteSingleChat = async(id) =>{
  const user = localStorage.getItem('user');
  try {
    const response = await api.delete(`/conversations/${id}`, {
      data: {
        user: user,
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error delete single:', error);
    throw error;
  }
}