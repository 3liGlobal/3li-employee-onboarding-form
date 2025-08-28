document.addEventListener('DOMContentLoaded', function () {
  var idFile = document.getElementById('idFile');
  var idFileName = document.getElementById('idFileName');
  var idFileClear = document.getElementById('idFileClear');
  var fileControl = idFile ? idFile.closest('.file-control') : null;
  var filePlaceholder = idFile ? (idFile.getAttribute('placeholder') || 'Click to upload') : '';

  if (idFile && idFileName) {
    function updateFileState() {
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

    idFile.addEventListener('change', updateFileState);
    if (idFileClear) {
      idFileClear.addEventListener('click', function () {
        idFile.value = '';
        updateFileState();
      });
    }
    updateFileState();
  }
});
document.getElementById("onboardingForm").addEventListener("submit", function(e) {
      e.preventDefault();
      let valid = true;
      const inputs = this.querySelectorAll("input, select");
      
      inputs.forEach(input => {
        const errorEl = input.nextElementSibling;
        if (errorEl && errorEl.classList.contains("error")) {
          if (input.hasAttribute("required") && !input.value) {
            errorEl.style.display = "block";
            valid = false;
          } else if (input.name === "phone" || input.name === "emergencyPhone") {
            const regex = /^[0-9]{10,15}$/;
            if (!regex.test(input.value)) {
              errorEl.style.display = "block";
              valid = false;
            } else {
              errorEl.style.display = "none";
            }
          } else if (input.name === "email") {
            const regex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!regex.test(input.value)) {
              errorEl.style.display = "block";
              valid = false;
            } else {
              errorEl.style.display = "none";
            }
          } else {
            errorEl.style.display = "none";
          }
        }
      });

      if (valid) {
        alert("Form submitted successfully!");
        this.reset();
      }
    });