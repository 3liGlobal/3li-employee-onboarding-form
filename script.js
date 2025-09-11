document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('onboardingForm');

  
  var idFile = document.getElementById('idFile');
  var idLabel = document.getElementById('idLabel');
  var idFileName = document.getElementById('idFileName');
  var idFileClear = document.getElementById('idFileClear');

  let cnicUploads = []; 

  function updateCnicState() {
    if (cnicUploads.length === 0) {
      idLabel.textContent = "Upload CNIC/ID (Front)*";
      idFileName.textContent = "";
      idFileClear.style.display = "none";
      idFile.disabled = false;
    } else if (cnicUploads.length === 1) {
      idLabel.textContent = "Upload CNIC/ID (Back)*";
      idFileName.textContent = "Front: " + cnicUploads[0].name;
      idFileClear.style.display = "inline-block";
      idFile.disabled = false;
    } else if (cnicUploads.length === 2) {
      idLabel.textContent = "CNIC Uploaded";
      idFileName.textContent =
        "Front: " + cnicUploads[0].name + " | Back: " + cnicUploads[1].name;
      idFileClear.style.display = "inline-block";
      idFile.disabled = true; // lock after both
    }
  }

  if (idFile) {
    idFile.addEventListener('change', function (e) {
      if (e.target.files.length > 0) {
        cnicUploads.push(e.target.files[0]);
        idFile.value = ""; // reset input for next step
        updateCnicState();
      }
    });
  }

  if (idFileClear) {
    idFileClear.addEventListener('click', function () {
      cnicUploads = [];
      idFile.value = "";
      updateCnicState();
    });
  }

  updateCnicState();

  // ===== RESUME UPLOAD =====
  var resumeFile = document.getElementById('resumeFile');
  var resumeFileName = document.getElementById('resumeFileName');
  var resumeFileClear = document.getElementById('resumeFileClear');

  function updateResumeState() {
    if (resumeFile && resumeFile.files && resumeFile.files.length > 0) {
      resumeFileName.textContent = resumeFile.files[0].name;
      resumeFileClear.style.display = "inline-block";
    } else {
      resumeFileName.textContent = "";
      resumeFileClear.style.display = "none";
    }
  }

  if (resumeFile) {
    resumeFile.addEventListener('change', function () {
      updateResumeState();
      validateField(resumeFile);
    });
  }

  if (resumeFileClear) {
    resumeFileClear.addEventListener('click', function () {
      resumeFile.value = "";
      updateResumeState();
      validateField(resumeFile);
    });
  }

  updateResumeState();

  // ===== VALIDATION =====
  var requiredNames = new Set([
    'firstName', 'lastName', 'gender', 'dob', 'nationality', 'cnic',
    'marital', 'phone', 'email', 'emergencyName', 'relationship', 'emergencyPhone',
    'resumeFile' 
    
  ]);

  function getErrorElement(field) {
    var current = field.parentElement;
    while (current && current !== document.body) {
      var error = current.querySelector && current.querySelector('.error');
      if (error) return error;
      current = current.parentElement;
    }
    return null;
  }

  function validateField(field) {
    if (!field || !field.name) return true;
    var name = field.name;
    var value = field.value != null ? String(field.value).trim() : '';
    var errorEl = getErrorElement(field);
    var isValid = true;

    //  CNIC front + back =====
    if (field.id === "idFile") {
      isValid = cnicUploads.length === 2; // require both
    }
    
    else if (requiredNames.has(name)) {
      if (field.type === 'file') {
        isValid = field.files && field.files.length > 0;
      } else if (field.tagName === 'SELECT') {
        isValid = value !== '';
      } else {
        isValid = value !== '';
      }
    }

    if (isValid && (name === 'phone' || name === 'emergencyPhone')) {
      var phoneRegex = /^[0-9]{10,15}$/;
      isValid = phoneRegex.test(value);
    }

    if (isValid && name === 'email') {
      var emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      isValid = emailRegex.test(value);
    }

    if (errorEl) errorEl.style.display = isValid ? 'none' : 'block';
    return isValid;
  }

  function validateForm(formEl) {
    var fields = formEl.querySelectorAll('input, select');
    var allValid = true;
    fields.forEach(function (field) {
      if (!validateField(field)) allValid = false;
    });
    
    if (cnicUploads.length !== 2) {
      var cnicError = getErrorElement(idFile);
      if (cnicError) cnicError.style.display = 'block';
      allValid = false;
    }
    return allValid;
  }

  
  form.addEventListener('input', function (e) {
    var target = e.target;
    if (target.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]')) {
      validateField(target);
    }
  });
  form.addEventListener('change', function (e) {
    var target = e.target;
    if (target.matches('select, input[type="file"]')) {
      validateField(target);
    }
  });

  
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var isValid = validateForm(form);
    if (isValid) {
      alert('Form submitted successfully!');
      form.reset();
      cnicUploads = [];
      updateCnicState();
      updateResumeState();
     
      var errors = form.querySelectorAll('.error');
      errors.forEach(function (err) { err.style.display = 'none'; });
    }
  });
});
document.querySelectorAll('input[type="file"]').forEach(input => {
  input.setAttribute('title', '');
});

