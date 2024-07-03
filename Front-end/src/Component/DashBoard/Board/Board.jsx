import React, { useState, useEffect } from 'react';
import StylesBoard from './Board.module.css';
import Card from '../Card/Card';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import AddModalElement from '../AddModalElement/AddModalElement';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal1, openModal1, toggleBoardSwitch } from '../../../redux/slice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import AddModalElementEdit from '../AddModalElementEdit/AddModalElementEdit';
import collapse from '../../../assets/collapse.png';
import Add from '../../../assets/Add.png';

const Board = () => {
    const [selectedOption, setSelectedOption] = useState('This Week');
    const [collapsed, setCollapsed] = useState({
        backlog: false,
        toDo: false,
        inProgress: false,
        done: false
    });

    const isOpenModal = useSelector(state => state.modal.isOpen);
    const isBoardChanged = useSelector(state => state.boardSwitch.isBoardSwitch);
    const isToasty = useSelector(state => state.toastyAction.toasty);
    const openEditModal = useSelector(state => state.modal2.isOpen);
    const taskId = useSelector((state) => state.itsTaskId.taskId);
    const dispatch = useDispatch();

    const onOpenModal = () => dispatch(openModal1());
    const onCloseModal = () => dispatch(closeModal1());

    const fetchTasks = async (userId, filter) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post("http://localhost:5000/api/tasks/gettasks", { userId, filter }, {
                headers: {
                    'Authorization': token
                }
            });
            console.log("Fetched tasks: ", response.data.tasks);
            return response.data.tasks;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    };

    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const userId = localStorage.getItem('id');
        const fetchData = async () => {
            try {
                const tasks = await fetchTasks(userId, selectedOption);
                setTasks(tasks);
                console.log("Tasks set: ", tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setTasks([]);
            }
        };
        fetchData();
    }, [selectedOption, isBoardChanged]);

    const handleSelectChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const myName = localStorage.getItem('name');

    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        const today = new Date();
        const formatted = `${getFormattedDay(today)} ${getFormattedMonth(today)}, ${today.getFullYear()}`;
        setFormattedDate(formatted);
    }, []);

    function getFormattedDay(date) {
        const day = date.getDate();
        if (day >= 11 && day <= 13) {
            return `${day}th`;
        }
        switch (day % 10) {
            case 1:
                return `${day}st`;
            case 2:
                return `${day}nd`;
            case 3:
                return `${day}rd`;
            default:
                return `${day}th`;
        }
    }

    function getFormattedMonth(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[date.getMonth()];
    }

    const renderTasks = (boardName) => {
        if (!tasks) {
            return <p>Loading...</p>;
        }
        return tasks
            .filter(task => task.board === boardName)
            .map((taskBoard, index) => (
                <div key={index}>
                    <Card
                        priority={taskBoard.priority}
                        title={taskBoard.title}
                        checklist={taskBoard.checklist}
                        myTaskId={taskBoard._id}
                        serverFetchedDate={taskBoard.dueDate}
                        collapsed={collapsed[boardName]}
                    />
                    <br />
                </div>
            ));
    };

    return (
        <>
            {isToasty && toast.success('Url Copied!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "light",
            })}
            <div>
                <br />
                <div className={StylesBoard.header}>
                    <div className={StylesBoard.headerTitle}>Welcome! {myName}</div>
                    <div className={StylesBoard.headerDate}>{formattedDate}</div>
                </div>
                <div className={StylesBoard.header}>
                    <div className={StylesBoard.headerTitle2}>Board</div>
                    <div className={StylesBoard.headerMenu}>
                        <div className={StylesBoard.dropdown}>
                            <select className={StylesBoard.dropdown} onChange={handleSelectChange} value={selectedOption}>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                            </select>
                        </div>
                    </div>
                </div>
                <br />
                <div>
                    <div className={`${StylesBoard.boardCards} ${StylesBoard.scroll}`} style={{ position: 'relative', left: '261px' }}>
                        <div className={StylesBoard.boardCards_background}>
                            <br />
                            <div className={StylesBoard.boardCards_backgroundTitle} style={{ position: 'relative', left: '-111px' }}>
                                Backlog
                                <img src={collapse} alt='collapse' style={{ position: 'relative', right: '-231px' }} onClick={() => setCollapsed({ ...collapsed, backlog: !collapsed.backlog })} />
                            </div>
                            {renderTasks('backlog')}
                        </div>
                        <div className={StylesBoard.boardCards_background}>
                            <br />
                            <div className={StylesBoard.boardCards_backgroundTitle} style={{ position: 'relative', left: '-111px' }}>
                                To do
                                <img src={Add} alt='add' style={{ position: 'relative', right: '-211px' }} onClick={onOpenModal} />
                                <img src={collapse} alt='collapse' style={{ position: 'relative', right: '-231px' }} onClick={() => setCollapsed({ ...collapsed, toDo: !collapsed.toDo })} />
                            </div>
                            {renderTasks('toDo')}
                        </div>
                        <div className={StylesBoard.boardCards_background}>
                            <br />
                            <div className={StylesBoard.boardCards_backgroundTitle} style={{ position: 'relative', left: '-100px' }}>
                                In progress
                                <img src={collapse} alt='collapse' style={{ position: 'relative', right: '-200px' }} onClick={() => setCollapsed({ ...collapsed, inProgress: !collapsed.inProgress })} />
                            </div>
                            {renderTasks('inProgress')}
                        </div>
                        <div className={StylesBoard.boardCards_background}>
                            <br />
                            <div className={StylesBoard.boardCards_backgroundTitle} style={{ position: 'relative', left: '-111px' }}>
                                Done
                                <img src={collapse} alt='collapse' style={{ position: 'relative', right: '-231px' }} onClick={() => setCollapsed({ ...collapsed, done: !collapsed.done })} />
                            </div>
                            {renderTasks('done')}
                        </div>
                    </div>
                </div>
            </div>
            <Modal open={isOpenModal} onClose={onCloseModal} center showCloseIcon={false} classNames={{ modal: `${StylesBoard.customModal}` }}>
                <AddModalElement />
            </Modal>
            <Modal open={openEditModal} onClose={onCloseModal} center showCloseIcon={false} classNames={{ modal: `${StylesBoard.customModal}` }}>
                <AddModalElementEdit taskId={taskId} />
            </Modal>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        </>
    );
};

export default Board;
