# gformWorkflow
A google script for automating workflows from google forms via google sheets

This script is dependant on the central function library being pulled into it's project, and requires that any associated google form be harvesting an email address from the form users.

Function Roadmap:

Check status of Submission - add a link to allow a HTML page response showing the approval status of an application from the intial confirmation email where approve=status on http get

Intialize Error reporting and attribute confirmation - initialize will only run once all attributes are set and will feedback the desired option, also have a 'reset form' option.

Log sheet becomes Admin sheet - central function library to have an install function to create and lock down an Admin sheet in place of a log sheet which will contain central logs as well as a form register. Form initialisations will auto update the Admin form inventory with their urls, pending jobs, Workflow type, error count and script versions. New script versions can be pushed to forms via this Admin sheet form inventory. 

RowID expansion - include both timestamp and email address as identifiers for row ID.

Conditional Routing - Form Ranger add-on for the forms can be used to populate fields that trigger conditional routing, will write an extension to the intialize function to create a separate sheet to specify value/email pairs which can than be used via form ranger to dynamically manage drop down lists, separate sheet will eventually become a 'config' sheet

Single and Double approval workflow - change approval email generation to use doGet as most mobile mail clients don't support HTML forms. Create custom final acceptance / rejection emails to the form initiator once the workflow is complete. Lock approval cells and workflow upon workflow completeion. * Single approval workflow functional, need to lock cells on workflow completeion

File attachment handling - allow approvers to review file uploads to forms with dynamic permissions

DONE - Approval response HTML pages - Custom HTML responses to approval workflows

Move script attributes to config sheet - update initialize function to harvest global attributes from a config sheet rather than sheet property attributes, more human centric workflow creation

Email confirmation workflow - for forms intended for use outside of google apps domain create a confirmation step where a form user needs to confirm their application via an email to the email they provide in the form before workflow commencement.

Google Sites Dashboards - Dashboards to monitor workflows and eroors.

Subsheet form metrics - Dasbhoard as a subsheet within the response form for tracking metrics.

Bulk email workflow - A tracking workflow type to create extra sheets within the responses sheet linking to dashboards to track acceptance and progress of staff initiated form campaigns.

Google Form extension - form Workflow installation and setup pushed to a Google form extension so form creators don't need to edit code or sheet config - user centric function. Eventually push logs and form config to json attached to Admin form. 

Contributor workflow - create email form input fields harvested into an a href get request to the web app where extra input

HR System integration - update subsheet data with HR system data... feedback into HR system would most likely require node dev though, at first would only facilitate data extraction
