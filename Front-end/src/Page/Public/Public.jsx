import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StylePublic from './Public.module.css';
import PublicTaskList from '../../Component/PublicTaskList/PublicTaskList';
import { Url } from '../../Utils/Url';
import logoimg  from '../../assets/download.svg';
import highPriorityImg from '../../assets/High.png';
import moderatePriorityImg from '../../assets/Moderate.png';
import lowPriorityImg from '../../assets/Low.png';
import NotFound from '../../Component/DashBoard/NotFound/NotFound';

const Public = ({ taskId }) => {
    const baseUrl = Url();

    const [publicTaskData, setPublicTaskData] = useState(null);
    let imgSrc = null;

    const showPublicTaskData = async (taskId) => {
        try {
            const response = await axios.get(`${baseUrl}/api/tasks/${taskId}`, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            setPublicTaskData(response.data);
        } catch (error) {
            console.error('Error fetching public task data:', error);
        }
    };

    useEffect(() => {
        showPublicTaskData(taskId);
    }, [taskId]);

    const setImage = (priority) => {
        switch (priority) {
            case 'HIGH PRIORITY':
                imgSrc = highPriorityImg;
                break;
            case 'MODERATE PRIORITY':
                imgSrc = moderatePriorityImg;
                break;
            default:
                imgSrc = lowPriorityImg;
        }
    };

    if (publicTaskData) {
        setImage(publicTaskData.priority);
    }

    const [taskName, setTaskName] = useState('');
    const [check, setCheck] = useState(null);

    let totalChecks = 0;
    const funTotalChecks = () => {
        publicTaskData?.checklist?.forEach((taskList) => {
            totalChecks++;
        });
        return totalChecks;
    };

    let checksMarked = 0;
    const funTotalChecksMarked = () => {
        publicTaskData?.checklist?.forEach((taskList) => {
            if (taskList.completed) {
                checksMarked++;
            }
        });
        return checksMarked;
    };

    useEffect(() => {
        funTotalChecksMarked();
    }, [taskId]);

    let theserverDate = publicTaskData?.dueDate || null;

    function formatDate(dateString) {
        const date = new Date(dateString);
        const monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];

        const day = date.getDate();
        const monthIndex = date.getMonth();
        const month = monthNames[monthIndex];

        let daySuffix = "th";
        if (day === 1 || day === 21 || day === 31) {
            daySuffix = "st";
        } else if (day === 2 || day === 22) {
            daySuffix = "nd";
        } else if (day === 3 || day === 23) {
            daySuffix = "rd";
        }

        return `${month} ${day}${daySuffix}`;
    }

    const formattedDate = theserverDate ? formatDate(theserverDate) : null;

    return (
        <>
            {console.log("theserverDate", theserverDate)}
            {console.log(publicTaskData)}
            {publicTaskData ? (
                <div className={StylePublic.public}>
                    <div className={StylePublic.logo}>
                        <img src={logoimg} alt='logo' style={{ width: '51px' }} />&nbsp;&nbsp;&nbsp;Pro Manage
                    </div>
                    <br />
                    <div className={StylePublic.cards}>
                        <div className={StylePublic.priorityText}>
                            <img src={imgSrc} alt='priority' />&nbsp;&nbsp;{publicTaskData.priority}
                        </div>
                        <br />
                        <div className={StylePublic.cardTitle}>
                            {publicTaskData.title}
                        </div>
                        <br /><br />
                        <div className={StylePublic.checklist}>
                            Checklist ({
                                funTotalChecksMarked()
                            }/{
                                funTotalChecks()
                            })
                        </div>
                        <br />
                        <div className={StylePublic.taskList}>
                            {
                                publicTaskData.checklist &&
                                publicTaskData.checklist.map((check, index) => (
                                    <PublicTaskList key={index} checked={check.completed} taskName={check.taskName} />
                                ))
                            }
                            {console.log(publicTaskData.checklist)}
                        </div>
                        <br />
                        {publicTaskData.dueDate && (
                            <div className={StylePublic.dueDateDiv}>
                                <span className={StylePublic.dueDateTitle}>Due Date</span> &nbsp;&nbsp;&nbsp;
                                <span className={StylePublic.dueDate}>{formattedDate}</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <NotFound />
            )}
        </>
    );
};

export default Public;
