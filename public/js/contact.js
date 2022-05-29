function showData() {
    // DOM = Document Object Model
    let name = document.getElementById("name").value
    let email = document.getElementById("email").value
    let phone = document.getElementById("phone").value
    let subject = document.getElementById("subject").value
    let message = document.getElementById("contactMessage").value

    document.getElementById("name").value = ""
    document.getElementById("email").value = ""
    document.getElementById("phone").value = ""
    document.getElementById("subject").value = ""
    document.getElementById("contactMessage").value = ""

    // VALIDATION
    if (name, email, phone, subject, message == "") {
        return alert("All form input must be filled to continue")
    }

    let emailReceiver = "hrd.tempatkerja@gmail.com"

    let a = document.createElement('a')
    a.href = `mailto:${emailReceiver}?subject=${subject}&body=Hello, my name ${name}, ${subject}, ${message}`
        // a.href = "https://www.autofun.co.id/mobil"
    a.click()

    // kata-kunci nama = {
    //     proprty-name : value
    // }

    let dataObject = {
        name: name,
        email: email,
        phone,
        subject,
        message
    }

    console.table(dataObject)
}