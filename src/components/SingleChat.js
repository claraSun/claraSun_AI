import { useEffect, useState, useCallback } from 'react';
import { getSingleConversation, createChat, updateSingleChat } from '../api/api';
import { ArrowUpIcon,CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { IconButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react';

const SingleChat = ({ propConversationId, fetchHistoryData }) => {
  const [conversationId, setConversationId] = useState(null); // 建立的 conversationId
  const [inputValue, setInputValue] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]); 
  const [hasCopy, setHasCopy] = useState(false)


  // 從 list 傳過來的 conversationId
  useEffect(() => {
    if (propConversationId && propConversationId !== 'null') {
      setConversationId(propConversationId);
    } else {
      // console.log('我有來重清空聊天室0')
      resetChat();
    }
  }, [propConversationId]);

  const resetChat = () => {
    // console.log('我有來重清空聊天室1')
    setConversationId(null);
    setInputValue('');
    setData(null);
    setMessages([]);
    setLoading(true);
  };

  // 初始化對話後更新资料 R
  const fetchData = useCallback(async (id) => {
    setInputValue('');
    // console.log('fetchData');
    try {
      const result = await getSingleConversation(id);
      let res = JSON.stringify(result.data);
      setData(res);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchData(conversationId);
    }
  }, [fetchData, conversationId]);

  useEffect(() => {
    if (data) {
      // 解析並合併 queries 和 answers
      const parsedData = JSON.parse(data);
      const combinedMessages = parsedData.flatMap((item) => [
        { type: 'query', text: item.query },
        { type: 'answer', text: item.answer }
      ]);

      setMessages(combinedMessages);
    }
  }, [data]);

  // C
  const initChat = async () => {
    // console.log('initChat');
    setLoading(true);
    setInputValue('');
    try {
      const response = await createChat(inputValue);
      const jsonStrings = response.split('\n\n').filter(str => str.startsWith('data:')).map(str => str.replace('data: ', ''));
      
      // 解析SON 字串提取 conversation_id
      jsonStrings.forEach(jsonString => {
        const data = JSON.parse(jsonString);
        if (data.conversation_id) {
          
          setConversationId(data.conversation_id);
        }
      });
      setLoading(false);
      if (conversationId) {
        fetchData(conversationId); // 更新目前對話
        updateChat(conversationId, inputValue);
      }
      fetchHistoryData();
    } catch (err) {
      console.error('Error creating chat', err);
      setLoading(false);
    }
  };

  // U
  const updateChat = async (id, value) => {
    console.log('updateChat', conversationId);
    setLoading(true);
    if(id === String) {
      try {
        await updateSingleChat(id || conversationId, value || inputValue);
        // console.log('更新對話成功', response);
        fetchData(conversationId);
      } catch (error) {
        console.error('Error updating data:', error);
      } finally {
        setLoading(false);
      }
    }
    else {
      try {
        await updateSingleChat(conversationId, value || inputValue);
        // console.log('更新對話成功', response);
        fetchData(conversationId);
      } catch (error) {
        console.error('Error updating data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      conversationId ? updateChat() : initChat();
    }
  };

  const copyShareURL = (message) =>{

  
    navigator.clipboard.writeText(message)
      .then(() => {
        console.log('複製成功', message);
        setHasCopy(true)
        setTimeout(() => {
          setHasCopy(false)
        }, 3000)
      })
      .catch((error) => {
        console.error('Failed to copy text: ', error);
      });
  }

  return (
    <div className='agent-container-chat'>
      <div className='agent-container-chat__btns'>
        <div>前端工程師_孫瑋翎</div>
        {/* <Avatar size='sm' name='Kent Dodds' src='https://bit.ly/kent-c-dodds' /> */}
      </div>

      {loading && messages.length === 0 ? (
        <div className='agent-container-chat__wrapper'>
          <div className='start-new'>
            請建立新的對話
          </div>
        </div>
      ) : (
        <div className='agent-container-chat__wrapper'>
          {messages.map((message, index) => (
            <div>
              <div className={message.type === 'query' ? 'query-block' : 'answer-block'} key={index}>
                <div>
                  {message.type === 'answer'
                    ? message.text.split('\n').map((paragraph, i) => 
                      <div key={i}>
                      <p>{paragraph}</p>
                      </div>
                    )
                    : message.text}
                </div>
              </div>
              {message.type === 'answer'
                ?
                <div onClick={()=>copyShareURL(message.text)}>
                  {hasCopy
                  ?<CheckIcon />
                  :<CopyIcon />}
                </div>
                : null
              }
            </div>
          ))}
        </div>
      )}

      <div>
        <InputGroup size='md'>
          <Input
            pr='4.5rem'
            variant='filled'
            placeholder='請輸入有關孫瑋翎的問題'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <InputRightElement width='3rem'>
            <IconButton
              aria-label='edit'
              colorScheme='blue'
              isRound={true}
              icon={<ArrowUpIcon />}
              onClick={conversationId ? updateChat : initChat}
            />
          </InputRightElement>
        </InputGroup>
      </div>
    </div>
  );
};

export default SingleChat;
