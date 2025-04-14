document.addEventListener('DOMContentLoaded', () => {
    let selectedStandard = '';
    let selectedLanguage = '';
    let studentData = {};
    let allResults = [];
    let currentUser = null;
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let currentInfoStep = 0;

    window.login = login;
    window.confirmLogout = confirmLogout;
    window.showLanguageSelection = showLanguageSelection;
    window.startTest = startTest;
    window.nextInfoStep = nextInfoStep;
    window.previousInfoStep = previousInfoStep;
    window.showTest = showTest;
    window.nextQuestion = nextQuestion;
    window.previousQuestion = previousQuestion;
    window.submitTest = submitTest;
    window.shareOnWhatsApp = shareOnWhatsApp;
    window.copyResultCode = copyResultCode;
    window.goBack = goBack;
    window.exportAllToExcel = exportAllToExcel;
    window.toggleRecommendations = toggleRecommendations;
    window.downloadCertificate = downloadCertificate;
    window.clearReports = clearReports;
    window.addNewUser = addNewUser;
    window.updatePassword = updatePassword;
    window.deleteUser = deleteUser;
    window.resetOwnPassword = resetOwnPassword;
    window.resetUserPassword = resetUserPassword;

    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    async function loadResults() {
        try {
            const response = await fetch('http://localhost:3000/api/results');
            const result = await response.json();
            if (result.success) {
                allResults = result.results;
            }
        } catch (error) {
            showAlert('error', 'Failed to load previous results.');
        }
    }

    async function loadUsers() {
        try {
            // Implement server-side user fetch if needed
            return [];
        } catch (error) {
            showAlert('error', 'Failed to load users.');
            return [];
        }
    }

    function resetUI() {
        const sections = [
            'login-section', 'standard-selection', 'language-selection',
            'info-section', 'instructions-section', 'test-section',
            'results-section', 'admin-section'
        ];
        sections.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        document.getElementById('login-section')?.classList.remove('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        currentInfoStep = 0;
        currentQuestionIndex = 0;
        userAnswers = {};
        studentData = {};
        selectedStandard = '';
        selectedLanguage = '';
    }

    function showWelcomeScreen() {
        const branding = window.getClientBranding();
        if (!branding) {
            showAlert('error', 'Client branding not found.');
            return;
        }
        const container = document.querySelector('.container');
        const welcomeSection = document.createElement('section');
        welcomeSection.id = 'welcome-section';
        welcomeSection.innerHTML = `
            <h2>Welcome to ${branding.name}</h2>
            <p>${branding.address}</p>
            <p><i class="fas fa-phone"></i> ${branding.phone}</p>
        `;
        container.appendChild(welcomeSection);
        setTimeout(() => {
            welcomeSection.classList.add('exiting');
            setTimeout(() => {
                welcomeSection.remove();
                if (currentUser && currentUser.role === 'admin') {
                    showAdminDashboard();
                } else {
                    document.getElementById('standard-selection')?.classList.remove('hidden');
                    updateBrandingThroughout();
                }
            }, 400);
        }, 3000);
    }

    function updateBrandingThroughout() {
        const branding = window.getClientBranding();
        if (!branding) return;
        const sections = [
            'standard-selection', 'language-selection', 'info-section',
            'instructions-section', 'test-section', 'results-section', 'admin-section'
        ];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section && !section.classList.contains('hidden')) {
                let existingBranding = section.querySelector('.branding');
                if (existingBranding) existingBranding.remove();
                const brandingDiv = document.createElement('div');
                brandingDiv.className = 'branding';
                brandingDiv.innerHTML = `
                    <p class="institute">${branding.name}</p>
                    <p class="location">${branding.address}</p>
                    <p class="contact"><i class="fas fa-phone"></i> ${branding.phone}</p>
                `;
                section.appendChild(brandingDiv);
            }
        });
        const resultsSection = document.getElementById('results-section');
        if (resultsSection && !resultsSection.classList.contains('hidden')) {
            const contactMessage = document.querySelector('.contact-message p');
            if (contactMessage) {
                contactMessage.innerHTML = `For detailed discussion and counseling regarding your child's progress plan, please contact ${branding.name} at <i class="fas fa-phone"></i> <strong>${branding.phone}</strong>. Share your result with admin now for further processing.`;
            }
            const brandingFooter = document.querySelector('.branding-footer p');
            if (brandingFooter) {
                brandingFooter.innerHTML = `${branding.name}, ${branding.address} | <i class="fas fa-phone"></i> ${branding.phone}`;
            }
        }
    }

    async function login() {
        const email = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (!email || !password) {
            showAlert('error', 'Please enter both email and password.');
            return;
        }
        const authResult = await window.authenticate(email, password);
        if (authResult) {
            currentUser = authResult;
            document.getElementById('login-section').classList.add('hidden');
            showWelcomeScreen();
        } else {
            showAlert('error', 'Invalid email or password.');
        }
    }

    async function confirmLogout() {
        if (confirm('Are you sure you want to logout?')) {
            await window.logout();
            currentUser = null;
            resetUI();
        }
    }

    async function resetOwnPassword() {
        showAlert('error', 'Password reset not implemented on client-side.');
    }

    async function resetUserPassword() {
        showAlert('error', 'Password reset not implemented on client-side.');
    }

    function goBack(currentSection) {
        const sections = {
            'language-selection': 'standard-selection',
            'info-section': 'language-selection',
            'instructions-section': 'info-section',
            'test-section': 'instructions-section'
        };
        const current = document.getElementById(currentSection);
        const target = document.getElementById(sections[currentSection]);
        if (current && target) {
            current.classList.add('hidden');
            target.classList.remove('hidden');
            updateBrandingThroughout();
        } else {
            showAlert('error', 'Navigation error occurred.');
        }
        if (currentSection === 'test-section') currentQuestionIndex = 0;
    }

    function showLanguageSelection() {
        selectedStandard = document.getElementById('standard').value;
        if (!selectedStandard) {
            showAlert('error', 'Please select a grade.');
            return;
        }
        document.getElementById('standard-selection').classList.add('hidden');
        document.getElementById('language-selection').classList.remove('hidden');
        updateBrandingThroughout();
    }

    function startTest(language) {
        selectedLanguage = language;
        document.getElementById('language-selection').classList.add('hidden');
        document.getElementById('info-section').classList.remove('hidden');
        document.getElementById('info-title').textContent = language === 'english' ? 'Student Information' : 'विद्यार्थ्याची माहिती';
        updateBrandingThroughout();
        loadInfoStep(currentInfoStep);
    }

    const infoFields = [
        { id: 'student-name', labelEn: "Student's Name", labelMr: 'विद्यार्थ्याचे नाव', type: 'text' },
        { id: 'parent-name', labelEn: "Parent's Name", labelMr: 'पालकांचे नाव', type: 'text' },
        { id: 'mobile', labelEn: 'Mobile', labelMr: 'मोबाइल', type: 'text' },
        { id: 'email', labelEn: 'Email', labelMr: 'ईमेल', type: 'email' },
        { id: 'age', labelEn: 'Age', labelMr: 'वय', type: 'number' },
        { id: 'grade', labelEn: 'Grade', labelMr: 'इयत्ता', type: 'text', readonly: true },
        {
            id: 'board', labelEn: 'Board', labelMr: 'बोर्ड', type: 'select', options: [
                { value: '', textEn: 'Select Board', textMr: 'बोर्ड निवडा' },
                { value: 'SSC', textEn: 'SSC (Maharashtra State Board)', textMr: 'एसएससी (महाराष्ट्र राज्य मंडळ)' },
                { value: 'CBSE', textEn: 'CBSE', textMr: 'सीबीएसई' },
                { value: 'ICSE', textEn: 'ICSE', textMr: 'आयसीएसई' },
                { value: 'IB', textEn: 'IB', textMr: 'आयबी' },
                { value: 'IGCSE', textEn: 'IGCSE', textMr: 'आयजीसीएसई' }
            ]
        }
    ];

    function loadInfoStep(step) {
        const field = infoFields[step];
        const stepDiv = document.getElementById('info-step');
        stepDiv.innerHTML = `
            <div class="form-group">
                <label for="${field.id}">${selectedLanguage === 'english' ? field.labelEn : field.labelMr}</label>
                ${field.type === 'select' ?
                `<select id="${field.id}" aria-label="${selectedLanguage === 'english' ? field.labelEn : field.labelMr}" required>
                        ${field.options.map(opt => `<option value="${opt.value}">${selectedLanguage === 'english' ? opt.textEn : opt.textMr}</option>`).join('')}
                    </select>` :
                `<input type="${field.type}" id="${field.id}" ${field.readonly ? 'readonly' : ''} aria-label="${selectedLanguage === 'english' ? field.labelEn : field.labelMr}" ${field.readonly ? '' : 'required'}>`
            }
            </div>
        `;
        if (field.id === 'grade') {
            document.getElementById('grade').value = selectedStandard + (selectedLanguage === 'english' ? 'th' : 'वी');
        }
        document.getElementById('info-back-btn').style.display = step > 0 ? 'inline-block' : 'none';
        document.getElementById('info-next-btn').textContent = step === infoFields.length - 1 ?
            (selectedLanguage === 'english' ? 'Finish' : 'संपवा') :
            (selectedLanguage === 'english' ? 'Next' : 'पुढे');
    }

    function nextInfoStep() {
        const field = infoFields[currentInfoStep];
        const inputElement = document.getElementById(field.id);
        const input = field.type === 'select' ? inputElement.value : inputElement.value.trim();
        if (!input && !field.readonly) {
            showAlert('error', selectedLanguage === 'english' ? 'Please fill in this field.' : 'कृपया हा रकाना भरा.');
            return;
        }
        if (field.id === 'grade') {
            studentData[field.id] = selectedStandard + (selectedLanguage === 'english' ? 'th' : 'वी');
        } else {
            studentData[field.id] = input;
        }
        currentInfoStep++;
        if (currentInfoStep < infoFields.length) {
            loadInfoStep(currentInfoStep);
        } else {
            document.getElementById('info-section').classList.add('hidden');
            document.getElementById('instructions-section').classList.remove('hidden');
            document.getElementById('instructions-title').textContent = selectedLanguage === 'english' ? 'Instructions' : 'सूचना';
            document.getElementById('instructions-content').innerHTML = selectedLanguage === 'english' ? `
                <p>No time limit.</p>
                <p>All questions are compulsory.</p>
                <p>All the best!</p>
            ` : `
                <p>वेळेची मर्यादा नाही.</p>
                <p>सर्व प्रश्न अनिवार्य आहेत.</p>
                <p>सर्वांना शुभेच्छा!</p>
            `;
            updateBrandingThroughout();
        }
    }

    function previousInfoStep() {
        if (currentInfoStep > 0) {
            const field = infoFields[currentInfoStep];
            const inputElement = document.getElementById(field.id);
            const input = field.type === 'select' ? inputElement.value : inputElement.value.trim();
            if (input) studentData[field.id] = input;
            currentInfoStep--;
            loadInfoStep(currentInfoStep);
            updateBrandingThroughout();
        }
    }

    function showTest() {
        document.getElementById('instructions-section').classList.add('hidden');
        document.getElementById('test-section').classList.remove('hidden');
        document.getElementById('test-title').textContent = selectedLanguage === 'english' ?
            `Psychological Test for Grade ${selectedStandard}` :
            `इयत्ता ${selectedStandard} साठी मनोवैज्ञानिक चाचणी`;
        updateBrandingThroughout();
        loadQuestion(currentQuestionIndex);
    }

    function loadQuestion(index) {
        const qDiv = document.getElementById('questions');
        qDiv.innerHTML = '';
        const questions = selectedStandard <= 8 ? window.questions5to8?.[selectedLanguage] : window.questions9to10?.[selectedLanguage];
        if (!questions) {
            showAlert('error', 'Questions not found.');
            return;
        }
        if (index < questions.length) {
            const q = questions[index];
            const div = document.createElement('div');
            div.className = 'question';
            div.innerHTML = `<p>${q.text}</p><div class="options"></div>`;
            const optionsDiv = div.querySelector('.options');
            q.options.forEach(option => {
                const checked = userAnswers[index] === option ? 'checked' : '';
                optionsDiv.innerHTML += `
                    <label>
                        <input type="radio" name="q${index}" value="${option}" ${checked}>
                        <span>${option}</span>
                    </label>
                `;
            });
            qDiv.appendChild(div);
            document.getElementById('progress-fill').style.width = `${((index + 1) / questions.length) * 100}%`;
            document.getElementById('progress-text').textContent = `Question ${index + 1} of ${questions.length}`;
            document.getElementById('back-btn').style.display = index > 0 ? 'inline-block' : 'none';
            document.getElementById('next-btn').style.display = index < questions.length - 1 ? 'inline-block' : 'none';
            document.getElementById('submit-btn').style.display = index === questions.length - 1 ? 'inline-block' : 'none';
        }
    }

    function nextQuestion() {
        const questions = selectedStandard <= 8 ? window.questions5to8?.[selectedLanguage] : window.questions9to10?.[selectedLanguage];
        const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
        if (!selected) {
            showAlert('error', selectedLanguage === 'english' ? 'Please select an option.' : 'कृपया एक पर्याय निवडा.');
            return;
        }
        userAnswers[currentQuestionIndex] = selected.value;
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) loadQuestion(currentQuestionIndex);
    }

    function previousQuestion() {
        const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
        if (selected) userAnswers[currentQuestionIndex] = selected.value;
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);
        }
    }

    async function submitTest() {
        const questions = selectedStandard <= 8 ? window.questions5to8?.[selectedLanguage] : window.questions9to10?.[selectedLanguage];
        const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
        if (!selected) {
            showAlert('error', selectedLanguage === 'english' ? 'Please select an option.' : 'कृपया एक पर्याय निवडा.');
            return;
        }
        userAnswers[currentQuestionIndex] = selected.value;
        let allAnswered = true;
        let unansweredQuestions = [];
        for (let i = 0; i < questions.length; i++) {
            if (!userAnswers.hasOwnProperty(i) || !userAnswers[i]) {
                allAnswered = false;
                unansweredQuestions.push(i + 1);
            }
        }
        if (!allAnswered) {
            showAlert('error', selectedLanguage === 'english' ?
                `Please answer all questions. Unanswered: ${unansweredQuestions.join(', ')}` :
                `कृपया सर्व प्रश्नांची उत्तरे द्या. अनुत्तरित: ${unansweredQuestions.join(', ')}`);
            return;
        }
        try {
            const result = window.calculateResults?.(Number(selectedStandard), selectedLanguage, userAnswers);
            if (!result || !result.detailedResult) throw new Error('Result calculation failed.');
            const fullResult = { ...studentData, ...result };
            await fetch('http://localhost:3000/api/saveResult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.clientId, resultData: fullResult })
            });
            allResults.push(fullResult);
            document.getElementById('test-section').classList.add('hidden');
            showAlert('success', selectedLanguage === 'english' ?
                `Test completed, ${studentData['student-name']}!` :
                `चाचणी पूर्ण झाली, ${studentData['student-name']}!`);
            setTimeout(() => {
                const resultsSection = document.getElementById('results-section');
                resultsSection.classList.remove('hidden');
                document.getElementById('results-title').textContent = selectedLanguage === 'english' ? 'Your Results' : 'तुमचे निकाल';
                document.getElementById('trophy-sign').classList.remove('hidden');
                const scores = fullResult.detailedResult?.scores || {};
                const scoresDisplay = selectedStandard <= 8 ?
                    `<p><strong>Score:</strong> ${scores.score ?? 'N/A'}/${scores.totalQuestions ?? 'N/A'} (${scores.percentage ?? 'N/A'}%)</p>` :
                    `
                        <p><strong>Realistic:</strong> ${scores.realistic ?? 'N/A'}</p>
                        <p><strong>Investigative:</strong> ${scores.investigative ?? 'N/A'}</p>
                        <p><strong>Artistic:</strong> ${scores.artistic ?? 'N/A'}</p>
                        <p><strong>Social:</strong> ${scores.social ?? 'N/A'}</p>
                        <p><strong>Enterprising:</strong> ${scores.enterprising ?? 'N/A'}</p>
                        <p><strong>Conventional:</strong> ${scores.conventional ?? 'N/A'}</p>
                    `;
                document.getElementById('result-content').innerHTML = `
                    <div class="result-details">
                        <p><strong>Date:</strong> ${fullResult.date}</p>
                        <p><strong>Student:</strong> ${fullResult['student-name']}</p>
                        <p><strong>Parent:</strong> ${fullResult['parent-name']}</p>
                        <p><strong>Mobile:</strong> ${fullResult.mobile}</p>
                        <p><strong>Email:</strong> ${fullResult.email}</p>
                        <p><strong>Grade:</strong> ${fullResult.grade}</p>
                        <p><strong>Board:</strong> ${fullResult.board}</p>
                        ${scoresDisplay}
                        <p><strong>Summary:</strong> ${fullResult.summary}</p>
                        <p><strong>Analysis:</strong> ${fullResult.detailedResult.analysis}</p>
                        <h4>Recommendations</h4>
                        <div class="recommendations-toggle" onclick="toggleRecommendations()">Click to Expand</div>
                        <ol class="recommendations-list" id="recommendations-list">
                            ${fullResult.detailedResult.recommendations.map(r => `<li>${r}</li>`).join('')}
                        </ol>
                    </div>
                `;
                updateBrandingThroughout();
            }, 2000);
        } catch (error) {
            showAlert('error', `Failed to submit test: ${error.message}`);
        }
    }

    function toggleRecommendations() {
        document.getElementById('recommendations-list').classList.toggle('active');
    }

    function shareOnWhatsApp() {
        const resultContent = document.getElementById('result-content').textContent;
        const branding = window.getClientBranding();
        if (resultContent) {
            const whatsappUrl = `https://wa.me/${branding.phone}?text=${encodeURIComponent(resultContent)}`;
            window.open(whatsappUrl, '_blank');
        } else {
            showAlert('error', 'No results to share.');
        }
    }

    function copyResultCode() {
        const resultContent = document.getElementById('result-content').textContent;
        if (resultContent) {
            navigator.clipboard.writeText(resultContent).then(() => {
                showAlert('success', 'Result copied to clipboard.');
            }).catch(() => {
                showAlert('error', 'Failed to copy result.');
            });
        } else {
            showAlert('error', 'No results to copy.');
        }
    }

    function downloadCertificate() {
        const branding = window.getClientBranding();
        if (!window.jspdf || !window.jspdf.jsPDF) {
            showAlert('error', 'Certificate generation library not loaded.');
            return;
        }
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            doc.setLineWidth(2);
            doc.setDrawColor(218, 165, 32);
            doc.rect(8, 8, 281, 194, 'S');
            doc.setLineWidth(1);
            doc.setDrawColor(0, 86, 112);
            doc.rect(11, 11, 275, 188, 'S');
            doc.setFillColor(255, 111, 97);
            doc.triangle(100, 30, 197, 30, 148.5, 50, 'F');
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text('Certified', 148.5, 40, { align: 'center' });
            doc.setFillColor(0, 86, 112);
            doc.rect(30, 15, 237, 25, 'F');
            doc.setFontSize(28);
            doc.setFont('times', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('Psychometrica Pro Plus', 148.5, 25, { align: 'center' });
            doc.setFontSize(14);
            doc.text(`${branding.name}, ${branding.address}`, 148.5, 35, { align: 'center' });
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 0);
            doc.text('Certificate of Completion', 148.5, 70, { align: 'center' });
            doc.setFontSize(14);
            doc.text('Awarded to', 148.5, 85, { align: 'center' });
            doc.setFontSize(30);
            doc.setFont('times', 'bolditalic');
            doc.setTextColor(0, 86, 112);
            doc.text(studentData['student-name'] || 'Student', 148.5, 100, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('times', 'normal');
            doc.setTextColor(0, 0, 0);
            const formattedGrade = selectedStandard ?
                (selectedStandard + (selectedLanguage === 'english' ? 'th' : 'वी')) :
                (studentData.grade?.replace(/[^0-9thवी]/g, '') || 'N/A');
            doc.text(`Standard: ${formattedGrade}`, 148.5, 115, { align: 'center' });
            doc.text(`Board: ${studentData.board || 'N/A'}`, 148.5, 125, { align: 'center' });
            doc.text('for completing the Psychometric Assessment', 148.5, 140, { align: 'center' });
            doc.text(`on ${allResults[allResults.length - 1]?.date || 'N/A'}`, 148.5, 150, { align: 'center' });
            doc.setLineWidth(0.5);
            doc.line(120, 175, 180, 175);
            doc.setFontSize(14);
            doc.setFont('times', 'italic');
            doc.setTextColor(0, 86, 112);
            doc.text(branding.name, 148.5, 165, { align: 'center' });
            doc.setFontSize(12);
            doc.text('Authorized Sign', 148.5, 180, { align: 'center' });
            doc.save(`Psychometrica_Certificate_${studentData['student-name'] || 'Student'}.pdf`);
        } catch (error) {
            showAlert('error', 'Failed to generate certificate.');
        }
    }

    async function showAdminDashboard() {
        const sections = [
            'login-section', 'standard-selection', 'language-selection',
            'info-section', 'instructions-section', 'test-section', 'results-section'
        ];
        sections.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        const adminSection = document.getElementById('admin-section');
        adminSection.classList.remove('hidden');
        const users = await loadUsers();
        document.getElementById('admin-content').innerHTML = `
            <table id="results-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Student</th>
                        <th>Parent</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Grade</th>
                        <th>Board</th>
                        <th>Summary</th>
                    </tr>
                </thead>
                <tbody>
                    ${allResults.map(r => `
                        <tr>
                            <td>${r.date || 'N/A'}</td>
                            <td>${r.studentData?.['student-name'] || 'N/A'}</td>
                            <td>${r.studentData?.['parent-name'] || 'N/A'}</td>
                            <td>${r.studentData?.mobile || 'N/A'}</td>
                            <td>${r.studentData?.email || 'N/A'}</td>
                            <td>${r.studentData?.grade || 'N/A'}</td>
                            <td>${r.studentData?.board || 'N/A'}</td>
                            <td>${r.summary || 'N/A'}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="8">No reports available</td></tr>'}
                </tbody>
            </table>
        `;
        document.getElementById('users-table-body').innerHTML = users.length > 0 ?
            users.map(user => `
                <tr>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.role || 'N/A'}</td>
                </tr>
            `).join('') :
            '<tr><td colspan="2">No users available</td></tr>';
        updateBrandingThroughout();
    }

    async function clearReports() {
        if (confirm('Are you sure you want to clear all reports? This action cannot be undone.')) {
            try {
                await fetch('http://localhost:3000/api/clearResults', { method: 'POST' });
                allResults = [];
                document.getElementById('admin-content').innerHTML = `
                    <table id="results-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Parent</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                <th>Grade</th>
                                <th>Board</th>
                                <th>Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="8">No reports available</td>
                            </tr>
                        </tbody>
                    </table>
                `;
                showAlert('success', 'All reports have been cleared successfully.');
            } catch (error) {
                showAlert('error', 'Failed to clear reports. Please try again.');
            }
        }
    }

    function exportAllToExcel() {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Date,Student,Parent,Mobile,Email,Age,Grade,Board,Summary\n';
        allResults.forEach(result => {
            const row = [
                result.date,
                result.studentData?.['student-name'],
                result.studentData?.['parent-name'],
                result.studentData?.mobile,
                result.studentData?.email,
                result.studentData?.age,
                result.studentData?.grade,
                result.studentData?.board,
                result.summary
            ].map(field => `"${field ?? 'N/A'}"`).join(',');
            csvContent += row + '\n';
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Psychometrica_Results_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function addNewUser() {
        showAlert('error', 'User management is now handled via server.');
    }

    function updatePassword() {
        showAlert('error', 'Password management is now handled via server.');
    }

    function deleteUser() {
        showAlert('error', 'User management is now handled via server.');
    }

    loadResults();
});
