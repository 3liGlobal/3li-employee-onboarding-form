document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('onboardingForm');
  var idFile = document.getElementById('idFile');
  var idFileName = document.getElementById('idFileName');
  var idFileClear = document.getElementById('idFileClear');
  var fileControl = idFile ? idFile.closest('.file-control') : null;
  var filePlaceholder = idFile ? (idFile.getAttribute('placeholder') || 'Click to upload') : '';

  // File control UI behavior
  function updateFileState() {
    if (!idFile || !idFileName) return;
    if (idFile.files && idFile.files.length > 0) {
      idFileName.textContent = idFile.files[0].name;
      idFileName.style.display = 'inline-block';
      if (fileControl) fileControl.classList.add('has-file');
      if (idFileClear) idFileClear.style.display = 'inline-block';
    } else {
      idFileName.textContent = filePlaceholder;
      idFileName.style.display = 'inline-block';
      if (fileControl) fileControl.classList.remove('has-file');
      if (idFileClear) idFileClear.style.display = 'none';
    }
  }

  if (idFile) {
    idFile.addEventListener('change', function () {
      updateFileState();
      validateField(idFile);
    });
  }
  if (idFileClear) {
    idFileClear.addEventListener('click', function () {
      if (!idFile) return;
      idFile.value = '';
      updateFileState();
      validateField(idFile);
    });
  }
  updateFileState();

  // Validation helpers
  var requiredNames = new Set([
    'firstName', 'lastName', 'gender', 'dob', 'nationality', 'cnic',
    'marital', 'idFile', 'phone', 'email', 'emergencyName', 'relationship', 'emergencyPhone'
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

    if (requiredNames.has(name)) {
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
    return allValid;
  }

  // Real-time error clearing
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

  // Submit handler
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var isValid = validateForm(form);
    if (isValid) {
      alert('Form submitted successfully!');
      form.reset();
      // Hide all errors after reset
      var errors = form.querySelectorAll('.error');
      errors.forEach(function (err) { err.style.display = 'none'; });
      // Refresh file UI
      setTimeout(updateFileState, 0);
    }
  });
});