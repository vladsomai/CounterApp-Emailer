'use strict'
const fetchDataLib = require('./fetchData')
const fs = require('fs')
import { parseHtmlFile } from './htmlParser'
import { Project } from './projectType'
import { ProjectDictionary } from './projectType'
import { EmailSender } from './emailSender'

async function main() {
  let oldProjectsFromDB: Project[] = []
  const emailer: EmailSender = new EmailSender()
  let Currentday = new Date().getDate()
  let Yesterday = 0
  let dayChanged: boolean = true

  while (true) {
    console.log(new Date(), "Fetching new data...");
    
    
    //only send the limit and warning emails once a day
    Currentday = new Date().getDate()
    if (Yesterday != Currentday) {
      console.log(new Date(), "Day changed...Sending email if limit is reached.");
      dayChanged = true
      Yesterday = Currentday
    }

    const dbResponse = await fetchDataLib.fetchData()
    if (dbResponse.status == 500) {
      console.log(
        'Could not read the data from database, please check the error message below:',
      )
      console.log(dbResponse.message)
      continue
    }

    const projectsFromDB: Project[] = dbResponse.message
    let projectsNeedMaintenance: ProjectDictionary[] = []

    projectsNeedMaintenance = checkProjectsData(
      projectsFromDB.slice(),
      oldProjectsFromDB.slice(),
    )

    const htmlRawContent = ReadContentFile()
    projectsNeedMaintenance.map(async (item: ProjectDictionary) => {
      let Subject = ''
      switch (item.issue) {
        case 'temperature_limit':
          Subject = 'Temperature limit reached'
          break
        case 'temperature_spike':
          Subject = 'Detection of temperature spike'
          break
        case 'limit':
          Subject = 'Adapter has reached contacts limit'
          break
        case 'warning':
          Subject = 'Adapter has reached contacts warning'
          break

        default:
          Subject =
            'If you receive this error, please contact your administrator!'
          break
      }

      const htmlContent = parseHtmlFile(htmlRawContent, item)

      if (dayChanged && (item.issue == 'limit' || item.issue == 'warning')) {
        console.log(
          'Sending email for Alert: ',
          item.issue,
          ' with Project name: ',
          item.project.project_name,
          ' Adapter code: ',
          item.project.adapter_code,
          ' Fixture type: ',
          item.project.fixture_type,
        )

        const emailSent = await emailer.sendEmail(
          item.project.owner_email,
          Subject,
          JSON.stringify(item),
          htmlContent,
        )

        if (emailSent) {
          console.log('\x1b[32m%s\x1b[0m', `Email sent!`)
          dayChanged = false
        }
      }

      if (
        item.issue == 'temperature_spike' ||
        item.issue == 'temperature_limit'
      ) {
        console.log(
          'Sending email for Alert: ',
          item.issue,
          ' with Project name: ',
          item.project.project_name,
          ' Adapter code: ',
          item.project.adapter_code,
          ' Fixture type: ',
          item.project.fixture_type,
        )

        const emailSent = await emailer.sendEmail(
          item.project.owner_email,
          Subject,
          JSON.stringify(item),
          htmlContent,
        )

        if (emailSent) {
          console.log('\x1b[32m%s\x1b[0m', `Email sent!`)
        }
      }
    })

    await sleep(1000 * 60 * 15);
    // await sleep(10000)
    oldProjectsFromDB = projectsFromDB.slice()
  }
}

main().catch(console.error)

const sleep = (time_ms: number) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, time_ms)
  })

const ReadContentFile = (): string => {
  try {
    return fs.readFileSync('./html/emailContent.html', 'utf8')
  } catch (err) {
    console.error(err)
  }
  return ''
}

/*
The following function will return a list of projects that have out of boundaries values,
if one project has exceeded its temperature -> add the project to the list
if one project has changed its temperature by 3 deg from previous -> add the project to the list
if one project has its contacts greater than limit -> add the project to the list and skip checking for warning (limit > contacts)
if one project has its contacts greater than warning -> add the project to the list ONLY IF the value of limit was not exceeded(warning > contacts < limit) 
*/
const checkProjectsData = (
  projects: Project[],
  oldProjectsFromDB: Project[],
): ProjectDictionary[] => {
  let projectsNeedMaintenance: ProjectDictionary[] = []

  projects.map((item) => {
    if (item.temperature > 27) {
      const itemDictionary: ProjectDictionary = {
        issue: 'temperature_limit',
        project: item,
      }
      projectsNeedMaintenance.push(itemDictionary)
    }

    //map over all the old projects and check if the temperature changed by 3 deg.
    oldProjectsFromDB.map((oldItem) => {
      if (
        oldItem.adapter_code === item.adapter_code &&
        oldItem.fixture_type === item.fixture_type
      ) {
        if (
          item.temperature - oldItem.temperature >= 3 ||
          oldItem.temperature - item.temperature >= 3
        ) {
          const itemDictionary: ProjectDictionary = {
            issue: 'temperature_spike',
            project: item,
          }
          console.log('\x1b[31m%s\x1b[0m', `!!!!Temperature spike!!!!`)
          projectsNeedMaintenance.push(itemDictionary)
        }
      }
    })

    let limitAdded_SkippingWarning = false
    if (item.contacts > item.contacts_limit) {
      const itemDictionary: ProjectDictionary = {
        issue: 'limit',
        project: item,
      }
      limitAdded_SkippingWarning = true
      projectsNeedMaintenance.push(itemDictionary)
    }

    if (!limitAdded_SkippingWarning) {
      //only add the warning if the limit was not added
      if (item.contacts > item.warning_at) {
        const itemDictionary: ProjectDictionary = {
          issue: 'warning',
          project: item,
        }
        projectsNeedMaintenance.push(itemDictionary)
      }
    }
  })

  return projectsNeedMaintenance
}
