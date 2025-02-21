// Global state
let employees = [];
const USD_TO_INR_RATE = 83; // Current approximate rate (you might want to use an API for real-time rates)

// Authentication check
const checkAuth = () => {
    if (!localStorage.getItem('isAuthenticated')) {
        window.location.href = '/login';
        return false;
    }
    return true;
};

// Utility functions
const convertUSDtoINR = (usdAmount) => {
    return usdAmount * USD_TO_INR_RATE;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

const showLoading = () => {
    document.querySelector('.loading-screen').classList.remove('hidden');
};

const hideLoading = () => {
    document.querySelector('.loading-screen').classList.add('hidden');
};

const showSection = (sectionId) => {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
};

const updateEmployeeSelects = () => {
    const selects = ['employeeSelect', 'payrollEmployee'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Employee</option>';
        employees.forEach(emp => {
            select.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
        });
    });
};

// Local Storage functions
const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const getFromLocalStorage = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

// Load initial data
employees = getFromLocalStorage('employees');
updateEmployeeSelects();

// Employee management
document.getElementById('employeeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    showLoading();
    
    const formData = {
        id: Date.now(),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        position: document.getElementById('position').value,
        salary: convertUSDtoINR(parseFloat(document.getElementById('salary').value)) // Convert USD to INR
    };

    employees.push(formData);
    saveToLocalStorage('employees', employees);
    updateEmployeeSelects();
    
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML += `
        <div>
            <span>${formData.name}</span>
            <span>${formData.email}</span>
            <span>${formData.position}</span>
            <span>${formatCurrency(formData.salary)}</span>
        </div>
    `;
    e.target.reset();
    hideLoading();
});

// Attendance management
document.getElementById('attendanceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    const formData = {
        employeeId: document.getElementById('employeeSelect').value,
        status: document.getElementById('status').value,
        date: new Date().toISOString()
    };

    let attendance = getFromLocalStorage('attendance');
    attendance.push(formData);
    saveToLocalStorage('attendance', attendance);
    
    alert('Attendance marked successfully!');
    e.target.reset();
});

// Payroll management
document.getElementById('payrollForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    showLoading();
    
    const employeeId = document.getElementById('payrollEmployee').value;
    const employee = employees.find(emp => emp.id == employeeId);
    
    const formData = {
        employeeId: employeeId,
        month: parseInt(document.getElementById('month').value),
        year: parseInt(document.getElementById('year').value),
        basicSalary: employee.salary,
        deductions: convertUSDtoINR(parseFloat(document.getElementById('deductions').value)) // Convert USD to INR
    };

    let payroll = getFromLocalStorage('payroll');
    payroll.push({
        ...formData,
        netSalary: formData.basicSalary - formData.deductions
    });
    saveToLocalStorage('payroll', payroll);
    
    const payrollResult = document.getElementById('payrollResult');
    payrollResult.innerHTML = `
        <div>
            <strong>Employee:</strong> ${employee.name}<br>
            <strong>Basic Salary:</strong> ${formatCurrency(formData.basicSalary)}<br>
            <strong>Deductions:</strong> ${formatCurrency(formData.deductions)}<br>
            <strong>Net Salary:</strong> ${formatCurrency(formData.basicSalary - formData.deductions)}
        </div>
    `;
    e.target.reset();
    hideLoading();
});

// Load existing data
const loadEmployees = () => {
    showLoading();
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML = '';
    employees.forEach(emp => {
        employeeList.innerHTML += `
            <div>
                <span>${emp.name}</span>
                <span>${emp.email}</span>
                <span>${emp.position}</span>
                <span>${formatCurrency(emp.salary)}</span>
            </div>
        `;
    });
    hideLoading();
};

// Add logout functionality
const addLogoutButton = () => {
    const nav = document.querySelector('nav');
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'nav-btn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = () => {
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
    };
    nav.appendChild(logoutBtn);
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    employees = getFromLocalStorage('employees');
    updateEmployeeSelects();
    loadEmployees();
    addLogoutButton();
    hideLoading();
});
