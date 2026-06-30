import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        // Open the window immediately to bypass browser popup blockers
        const printWindow = window.open("", "_blank")
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Generating Resume...</title>
                    <style>
                        body {
                            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            background: #1a1f27;
                            color: #fff;
                        }
                        .loader {
                            text-align: center;
                        }
                        .spinner {
                            border: 4px solid rgba(255,255,255,0.1);
                            width: 36px;
                            height: 36px;
                            border-radius: 50%;
                            border-left-color: #e1034d;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 15px;
                        }
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    </style>
                </head>
                <body>
                    <div class="loader">
                        <div class="spinner"></div>
                        <h2>Generating your resume...</h2>
                        <p>Please wait while we tailor it for the job description.</p>
                    </div>
                </body>
                </html>
            `)
            printWindow.document.close()
        }

        try {
            const data = await generateResumePdf({ interviewReportId })
            if (data && data.html && printWindow) {
                printWindow.document.open()
                printWindow.document.write(data.html)
                printWindow.document.close()
                printWindow.focus()
                setTimeout(() => {
                    printWindow.print()
                }, 500)
            } else if (printWindow) {
                printWindow.close()
            }
        }
        catch (error) {
            console.log(error)
            if (printWindow) {
                printWindow.close()
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}