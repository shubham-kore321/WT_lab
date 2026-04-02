let formArray = [];

function show() {

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let pass = document.getElementById("pass").value.trim();
    let dob = document.getElementById("dob").value;
    let country = document.getElementById("country").value;
    let address = document.getElementById("address").value.trim();

    // Get selected gender
    let gender = "";
    let genderRadios = document.getElementsByName("gender");
    for (let i = 0; i < genderRadios.length; i++) {
        if (genderRadios[i].checked) {
            gender = genderRadios[i].value;
        }
    }


    let hobbies = [];
    let checkboxes = document.querySelectorAll(".checkbox input:checked");
    checkboxes.forEach(function(box) {
        hobbies.push(box.value);
    });

  
    if (
        name === "" ||
        email === "" ||
        pass === "" ||
        dob === "" ||
        gender === "" ||
        hobbies.length === 0 ||
        address === ""
    ) {
        alert("Please fill all fields!");
        return;
    }

    let userData = {
        name: name,
        email: email,
        password: pass,
        dob: dob,
        gender: gender,
        hobbies: hobbies,
        country: country,
        address: address
    };

    formArray.push(userData);

    alert("Data Stored Successfully!");
    console.log(formArray);
}

function downloadData() {

    let content = JSON.stringify(formArray);

    let blob = new Blob([content], { type: "text/plain" });

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "formData.txt";
    link.click();
}