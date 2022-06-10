const nodemailer = require("nodemailer");

export class EmailSender {
    emailTransporter = null;
    emailSender: string = "svg_somai@yahoo.com";
    Subject: string = "";
    To: string = "";
    EmailBodyText: string = "";
    EmailBodyHTML: string = "";
  
    constructor() {
      this.emailTransporter = nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 465,
        service: "yahoo",
        secure: false,
        auth: {
          user: this.emailSender,
          pass: "tegprhqvxrwrnqts",
        },
        debug: false,
        logger: true,
      });
    }
  
    async sendEmail(
      toParam: string,
      subjectParam: string,
      textParam: string,
      htmlParam: string
    ) {
      this.To = toParam;
      this.Subject = subjectParam;
      this.EmailBodyText =
        "In case you view this message you must enable HTML in your emailing software.\nThe following adapter needs your attention, please schedule a maintenance for it ASAP!\n" +
        textParam;
      this.EmailBodyHTML = htmlParam;
  
      if (!isEmailValid(this.To)) {
        console.log("\x1b[31m%s\x1b[0m", "Error: Target email is invalid");
        return;
      }
  
      this.emailTransporter.sendMail({
        from: this.emailSender,
        to: "somaivlad@gmail.com",
        subject: this.Subject,
        text: this.EmailBodyText,
        html: this.EmailBodyHTML,
      });
    }
  }

  function isEmailValid(input: string) {
    var validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return input.match(validRegex) ? true : false;
  }
  