import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StylesCard from './Card.module.css';
import TaskList from '../TaskList/TaskList';
import { Url } from '../../../Utils/Url';
import { useDispatch } from 'react-redux';
import { toggleBoardSwitch, toggleLoader, openModal2, setTaskId } from '../../../redux/slice';
import high from '../../../assets/High.png';
import moderate from '../../../assets/Moderate.png';
import low from '../../../assets/Low.png';
import Down from '../../../assets/down.svg';
import Dot3 from '../../../assets/Dot3.png';

const Card = ({ priority, title, checklist, myTaskId, serverFetchedDate, collapsed, backgroundColor }) => {
    const baseUrl = Url();
    const [isVisible, setIsVisible] = useState(false);
    const [changeBoard, setChangeBoard] = useState("toDo");
    const [forceRender, setForceRender] = useState(false);

    const toggleVisibility = useCallback(() => {
        setIsVisible(prevState => !prevState);
    }, []);

    const dispatch = useDispatch();

    const img = () => {
        switch (priority) {
            case 'HIGH PRIORITY':
                return high;
            case 'MODERATE PRIORITY':
                return moderate;
            default:
                return low;
        }
    };

    const toggleBoard = useCallback(async (newBoard) => {
        dispatch(toggleLoader());
        try {
            const response = await axios.put(`${baseUrl}/api/tasks/updatetask/${myTaskId}`, { newBoard }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            setChangeBoard(response.data.task.board);
            dispatch(toggleBoardSwitch());
            setForceRender(prev => !prev);
        } catch (error) {
            console.error('Error updating board:', error);
        } finally {
            dispatch(toggleLoader());
        }
    }, [baseUrl, myTaskId, dispatch]);

    const handleChange = useCallback((newBoard) => {
        toggleBoard(newBoard);
    }, [toggleBoard]);

    const [dueDate, setDueDate] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [dueDatePassed, setDueDatePassed] = useState(null);

    useEffect(() => {
        const today = new Date();
        setDueDate(getFormattedDate(today));

        if (serverFetchedDate) {
            const dateParts = serverFetchedDate.split('T')[0].split('-');
            const serverDueDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`);
            setNewDueDate(getFormattedDate(serverDueDate));

            setDueDatePassed(serverDueDate < today);
        }
    }, [serverFetchedDate, changeBoard, myTaskId, forceRender]);

    const getFormattedDate = (date) => {
        const day = date.getDate();
        const month = getFormattedMonth(date.getMonth());
        const suffix = getDaySuffix(day);

        return `${month} ${day}${suffix}`;
    };

    const getFormattedMonth = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month];
    };

    const getDaySuffix = (day) => {
        if (day === 1 || day === 21 || day === 31) {
            return "st";
        } else if (day === 2 || day === 22) {
            return "nd";
        } else if (day === 3 || day === 23) {
            return "rd";
        } else {
            return "th";
        }
    };

    const totalChecks = checklist.length;
    const initialChecksMarked = checklist.filter(taskList => taskList.completed).length;
    const [checksMarked, setChecksMarked] = useState(initialChecksMarked);

    const updateChecksMarked = useCallback((completed) => {
        setChecksMarked(prevCount => completed ? prevCount + 1 : prevCount - 1);
    }, []);

    const [showOverlay, setShowOverlay] = useState(false);

    const toggleOverlay = useCallback(() => {
        setShowOverlay(prev => !prev);
    }, []);

    const deleteTask = useCallback(async (taskId) => {
        dispatch(toggleLoader());
        try {
            await axios.delete(`${baseUrl}/api/tasks/deletetask/${taskId}`, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            window.location.reload();
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            dispatch(toggleLoader());
        }
    }, [baseUrl, dispatch]);

    const [shareableLink, setShareableLink] = useState('');
    const [copied, setCopied] = useState(false);

    const generateShareableLink = useCallback((taskId) => {
        dispatch(toggleLoader());
        try {
            const shareableLink = `http://localhost:5173/sharedtasklink/${taskId}`;
            setShareableLink(shareableLink);
            navigator.clipboard.writeText(shareableLink);
            setCopied(true);
    
            setTimeout(() => setCopied(false), 1000);
        } catch (error) {
            console.error('Error generating shareable link:', error);
        } finally {
            dispatch(toggleLoader());
        }
    }, [dispatch]);

    const editTask = useCallback((taskId) => {
        dispatch(openModal2());
        dispatch(setTaskId(taskId));
    }, [dispatch]);

    const getDateClass = useCallback(() => {
        if (changeBoard === "done") {
            return StylesCard.butFooterDateGreen;
        }
        if (dueDatePassed) {
            return StylesCard.butFooterDatePassed;
        }
        return StylesCard.butFooterDate;
    }, [changeBoard, dueDatePassed]);

    return (
        <>
            <div className={StylesCard.card} key={myTaskId} style={{ backgroundColor }}>
                <div className={StylesCard.priorityText} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><img src={img()} alt='priority' />&nbsp;&nbsp;{priority}</div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <span>
                            <img src={Dot3} alt='3dot' style={{ position: 'absolute', right: '11px', paddingTop: '11px', paddingBottom: '15px', paddingLeft: '15px', paddingRight: '7px' }} onClick={toggleOverlay} />
                        </span>
                        {showOverlay && (
                            <div className={StylesCard.dropDown} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                                <div className={StylesCard.dropDownBut} onClick={() => editTask(myTaskId)}>Edit</div>
                                <div className={StylesCard.dropDownBut} onClick={() => generateShareableLink(myTaskId)}>Share</div>
                                <div className={StylesCard.dropDownButDel} onClick={() => deleteTask(myTaskId)}>Delete</div>
                            </div>
                        )}
                    </div>
                </div>
                <br />
                <div className={StylesCard.cardTitle}>{title}</div>
                <div className={StylesCard.checklist}>
                    Checklist ({checksMarked}/{totalChecks})
                    <button onClick={toggleVisibility} className={`${isVisible ? StylesCard.hideBut : StylesCard.showBut}`} style={{ width: '21px', height: '21px', position: 'relative', left: '170px' }}>
                        <img src={Down} alt='arrow' />
                    </button>
                </div>
                {((checklist && isVisible) || collapsed) && (
                    <div>
                        <br />
                        {checklist.map((taskList, index) => (
                            <TaskList key={index} taskName={taskList.taskName} completed={taskList.completed} taskListId={myTaskId} checkListId={taskList._id} myChecklistDisplay={updateChecksMarked} />
                        ))}
                    </div>
                )}
                <br />
                <div className={StylesCard.cardFooter} style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '1px' }}>
                    {newDueDate && (
                        <div className={getDateClass()}>
                            {newDueDate}
                        </div>
                    )}
                    <div className={StylesCard.cardFooter} style={{ position: 'relative', right: '-21px', display: 'flex', gap: '1px' }}>
                        <div className={StylesCard.butFooter} onClick={() => handleChange("backlog")}>BACKLOG</div>
                        <div className={StylesCard.butFooter} onClick={() => handleChange("inProgress")}>PROGRESS</div>
                        <div className={StylesCard.butFooter} onClick={() => handleChange("toDo")}>TO DO</div>
                        <div className={StylesCard.butFooter} onClick={() => handleChange("done")}>DONE</div>
                    </div>
                </div>
            </div>
            {showOverlay && (
                <div className={StylesCard.overlay} onClick={toggleOverlay}></div>
            )}
        </>
    );
};

export default Card;
