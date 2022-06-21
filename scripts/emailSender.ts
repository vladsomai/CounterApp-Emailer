const nodemailer = require('nodemailer')

export class EmailSender {
  emailTransporter
  emailSender: string = 'svg_somai@yahoo.com'

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: 'smtp.mail.yahoo.com',
      port: 465,
      service: 'yahoo',
      secure: false,
      auth: {
        user: this.emailSender,
        pass: 'tegprhqvxrwrnqts',
      },
      debug: false,
      logger: true,
    })
  }

  async sendEmail(
    toParam: string,
    subjectParam: string,
    textParam: string,
    htmlParam: string,
  ) {
    const EmailBodyText =
      'In case you view this message you must enable HTML in your emailing software.\nThe following adapter needs your attention, please schedule a maintenance for it ASAP!\n' +
      textParam

    // if (!isEmailValid(this.To)) {
    //
    //   return;
    // }

    const validEmails = parseEmailField(toParam)
    if (validEmails == '') {
      return false
    }

    await this.emailTransporter.sendMail({
      from: this.emailSender,
      to: validEmails,
      subject: subjectParam,
      text: EmailBodyText,
      html: htmlParam,
    })
    return true
  }
}

function isEmailValid(input: string) {
  let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  return input.match(validRegex) ? true : false
}

function parseEmailField(input: string): string {
  let emails: string[]

  if (!input.includes(';')) {
    if (isEmailValid(input)) {
      return input
    } else {
      console.log(new Date(),
        `Error: Target email is invalid: ${input}`,
      )
      return ''
    }
  } else {
    emails = input.split(';')
    let validEmails = emails.map((item) => {
      if (isEmailValid(item)) {
        console.log(`${item} is valid email`)
        return item
      } else {
        console.log(new Date(),
          `Error: Target email is invalid: ${item}`,
        )
        return null
      }
    })

    //filter all array to remove null objects and return the valid emails delimited by ;
    let validEmailsFiltered = validEmails.filter((n) => n)
    return validEmailsFiltered.join(';')
  }
}
