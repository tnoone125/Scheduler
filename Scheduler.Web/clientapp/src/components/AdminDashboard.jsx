import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { useNavigate } from 'react-router-dom';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function AdminDashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userDataLoading, setUserDataLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const rowsPerPage = 20;
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    const fetchData = async (page) => {
        const token = localStorage.getItem("jwtScheduler");

        if (!token) {
            console.log("No token found. Redirecting to login...");
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`api/scheduler/getPageData?page=${page + 1}&pageSize=${rowsPerPage}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            setData(result.logData);
            setTotalRecords(result.pageNums * rowsPerPage);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        const token = localStorage.getItem("jwtScheduler");
        if (!token) {
            console.log("No token found. Redirecting to login...");
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(`api/scheduler/getLoggedInUsers`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            setUserData(result.userData);
            setUserDataLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUserDataLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    useEffect(() => {
        fetchUserData();
    }, []);

    const onPageChange = (event) => {
        setCurrentPage(event.page);
    };

    return (
        <div>
            <h3>Admin Dashboard</h3>
            {(userData && userData.length > 0) &&
                <>
                    <h4>Currently Signed in Users</h4>
                    <DataTable
                        value={userData}
                        loading={userDataLoading}
                        responsiveLayout="scroll"
                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                        <Column field="username" header="User" sortable></Column>
                        <Column field="lastLogin" header="Login Time" sortable></Column>
                </DataTable>
                    <br/><br/><br/><br/><br/>
                </>
            }
            <DataTable value={data} loading={loading} paginator={false} responsiveLayout="scroll" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                <Column field="timestamp" header="Timestamp" sortable></Column>
                <Column field="action" header="Action" sortable></Column>
                <Column field="target" header="Target" sortable></Column>
                <Column field="name" header="Name" sortable></Column>
                <Column field="detail" header="Detail" sortable></Column>
            </DataTable>
            <Paginator
                first={currentPage * rowsPerPage}
                rows={rowsPerPage}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
            />
        </div>
    );
};