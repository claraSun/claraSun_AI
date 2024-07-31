import './App.css';
import './style.scss';
import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, EditIcon, InfoOutlineIcon, SmallCloseIcon,AddIcon } from '@chakra-ui/icons';
import { IconButton, useDisclosure, Button } from '@chakra-ui/react';
import { getAllConversation, deleteSingleChat } from './api/api';
import SingleChat from './components/SingleChat';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

function Home() {
  const { id } = useParams();

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [propConversationId, setPropConversationId] = useState(null);
  const deleteDialog = useDisclosure();
  const infoDialog = useDisclosure();
  const cancelRef = React.useRef();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true); // 用於控制歷史記錄的顯示或隱藏

  useEffect(() => {
    console.log('0')
    localStorage.removeItem('user');
    localStorage.removeItem('case_id');

  },[])

  useEffect(() => {
    console.log('1')
   
   
  }, [id]);

  const fetchHistoryData = useCallback(async () => {
    // console.log('fetchData');
    try {
      const caseId = localStorage.getItem('case_id');
      const result = await getAllConversation();
      let res = result.data;
      if (caseId) {
        res = res.filter(item => item.inputs && item.inputs.id === caseId);
      }

      // 按日期排序
      res.sort((a, b) => new Date(b.created_at * 1000) - new Date(a.created_at * 1000));

      setHistory(groupByDate(res));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  const groupByDate = (data) => {
    return data.reduce((acc, item) => {
      const date = new Date(item.created_at * 1000).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleClick = (id) => {
    // console.log('sent id', id);
    setPropConversationId(id);
    
  };

  const handleDeleteClick = (id) => {
    console.log('選中刪除的id', selectedConversationId);
    setSelectedConversationId(id);
    deleteDialog.onOpen();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSingleChat(selectedConversationId);
      fetchHistoryData(); // 刷新對話記錄
      setPropConversationId(null); // 清空選中的對話
      
      handleClick('null')
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      deleteDialog.onClose();
    }
  };

  const toggleHistoryVisibility = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const showInfo = () =>{
    console.log('show info');
    infoDialog.onOpen();
  }

  return (
      <div className={`agent-container ${isHistoryVisible ? '' : 'full'}`}>
        <div className={`agent-container-history ${isHistoryVisible ? '' : 'hidden'}`}>
          <div className='agent-container-history__btns'>
            {/* <IconButton variant='outline' colorScheme='blue' icon={<ArrowLeftIcon />} onClick={toggleHistoryVisibility} /> */}
            {/* <IconButton aria-label='edit' variant='outline' colorScheme='teal' icon={<EditIcon />} onClick={() => handleClick('null')} /> */}
            <ArrowLeftIcon boxSize={4} />
            <EditIcon boxSize={6} />
          </div>
          <div className='agent-container-history__wrapper'>
            {history && Object.keys(history).map((date, index) => (
              <div key={index} className='all-history'>
                <h3>{date}</h3>
                {history[date].map((item, idx) => (
                  <div className='single-chat' key={idx}>
                    <div className='goto-single' onClick={() => handleClick(item.id)}>
                      {item.id}
                    </div>
                    <div className='del-btn' onClick={() => handleDeleteClick(item.id)}>
                      <SmallCloseIcon />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className='agent-container-history__footer' onClick={showInfo}>
            {/* <InfoOutlineIcon /> */}
            ClaraSun_AI Beta
          </div>
        </div>

        <div className={isHistoryVisible ? 'hidden' : 'flat-btn'}>
          <IconButton variant='outline' colorScheme='blue' icon={<ArrowRightIcon />} onClick={toggleHistoryVisibility} />
        </div>
        <SingleChat propConversationId={propConversationId} fetchHistoryData={fetchHistoryData} />
        {/* <Routes>
          <Route path="/chat/:id" element={<SingleChat propConversationId={propConversationId} fetchHistoryData={fetchHistoryData} />} />
          <Route path="/" element={<SingleChat propConversationId={propConversationId} fetchHistoryData={fetchHistoryData} />} />
        </Routes> */}

        <AlertDialog isOpen={deleteDialog.isOpen} leastDestructiveRef={cancelRef} onClose={deleteDialog.onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                刪除對話記錄
              </AlertDialogHeader>

              <AlertDialogBody>
                確認要刪除嗎？
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={deleteDialog.onClose}>
                  Cancel
                </Button>
                <Button colorScheme='red' onClick={handleDeleteConfirm} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        {/* <AlertDialog isOpen={infoDialog.isOpen} leastDestructiveRef={cancelRef} onClose={infoDialog.onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                使用說明 : 
              </AlertDialogHeader>

              <AlertDialogBody className='info-style'>
              自傳資料持續訓練中<br/>
              <br/>
              1.可以直接輸入"孫瑋翎"查詢：<br/>
              <br/>
              2.也可輸入"年紀"、"自傳"等關鍵字查詢<br/>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={infoDialog.onClose}>
                  確認
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog> */}
      </div>
  );
}

export default Home;
