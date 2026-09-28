import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import API from "../../../api/axios";
import { toast } from "react-toastify";

import "./PrincipalFinancePage.css";


const PrincipalFinancePage = () => {

    // ==========================================================
    // SUMMARY
    // ==========================================================

    const [summary, setSummary] = useState({
        totalFees: 0,
        collectedFees: 0,
        pendingFees: 0,

        totalStudents: 0,
        paidStudents: 0,
        partiallyPaidStudents: 0,
        pendingStudents: 0,

        periodCollection: 0,
        transactionCount: 0,
    });


    // ==========================================================
    // COLLECTION DATA
    // ==========================================================

    const [collectionTrend, setCollectionTrend] =
        useState([]);

    const [collectionActivity, setCollectionActivity] =
        useState([]);


    // ==========================================================
    // LOADING
    // ==========================================================

const [loading, setLoading] =
    useState(false);

const [initialLoading, setInitialLoading] =
    useState(true);

    // ==========================================================
    // FILTERS
    // ==========================================================

    const [academicYear, setAcademicYear] =
        useState("2021-2022");

    const [startDate, setStartDate] =
        useState("");

    const [endDate, setEndDate] =
        useState("");


        const pageRef = useRef(null);
const summaryRef = useRef(null);
const chartRef = useRef(null);
const heatmapRef = useRef(null);




// ==========================================================
// GSAP — INITIAL PAGE ENTRANCE
// ==========================================================

useLayoutEffect(() => {

    if (initialLoading) return;

    const ctx = gsap.context(() => {

        const tl = gsap.timeline({
            defaults: {
                ease: "power3.out",
            },
        });


        // ==================================================
        // INITIAL STATES
        // ==================================================

        gsap.set(
            ".principal-finance-page-header",
            {
                autoAlpha: 0,
                y: 24,
            }
        );


        gsap.set(
            ".principal-finance-stat-card",
            {
                autoAlpha: 0,
                y: 20,
                scale: 0.99,
            }
        );


        gsap.set(
            ".principal-finance-chart-section",
            {
                autoAlpha: 0,
                y: 22,
                scale: 0.99,
            }
        );


        gsap.set(
            ".principal-finance-activity-section",
            {
                autoAlpha: 0,
                y: 22,
                scale: 0.99,
            }
        );


        gsap.set(
            ".principal-finance-chart-bar",
            {
                scaleY: 0,
                transformOrigin: "bottom",
            }
        );


        gsap.set(
            ".principal-finance-activity-cell:not(.empty)",
            {
                autoAlpha: 0,
                scale: 0.92,
            }
        );


        // ==================================================
        // HEADER
        // ==================================================

        tl.to(
            ".principal-finance-page-header",
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.75,
            }
        );


        // ==================================================
        // SUMMARY CARDS
        // ==================================================

        tl.to(
            ".principal-finance-stat-card",
            {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.08,
            },
            "-=0.42"
        );


        // ==================================================
        // MAIN CONTENT
        // ==================================================

        tl.to(
            ".principal-finance-chart-section",
            {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
            },
            "-=0.32"
        );


        tl.to(
            ".principal-finance-activity-section",
            {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
            },
            "<"
        );


        // ==================================================
        // CHART BARS
        // ==================================================

        tl.to(
            ".principal-finance-chart-bar",
            {
                scaleY: 1,
                duration: 0.65,
                stagger: 0.045,
                ease: "power3.out",
            },
            "-=0.35"
        );


        // ==================================================
        // HEATMAP
        // ==================================================

        tl.to(
            ".principal-finance-activity-cell:not(.empty)",
            {
                autoAlpha: 1,
                scale: 1,
                duration: 0.3,
                stagger: {
                    each: 0.012,
                    from: "start",
                },
                ease: "power2.out",
            },
            "-=0.45"
        );


    }, pageRef);


    return () => {
        ctx.revert();
    };

}, [initialLoading]);
        // ==========================================================
// HEATMAP MONTH
// ==========================================================


// ==========================================================
// HEATMAP STATE
// ==========================================================

const [heatmapMonth, setHeatmapMonth] = useState("current");

const [selectedHeatmapDay, setSelectedHeatmapDay] =
    useState(null);

    // ==========================================================
    // FETCH FINANCE
    // ==========================================================

    const fetchFinance = useCallback(
        async () => {

            try {

                setLoading(true);


                const params =
                    new URLSearchParams({

                        ...(academicYear && {
                            academicYear,
                        }),

                        ...(startDate && {
                            startDate,
                        }),

                        ...(endDate && {
                            endDate,
                        }),

                    });


                const response =
                    await API.get(
                        `/fees-allocation/principal/dashboard?${params.toString()}`
                    );


                const result =
                    response.data;


                if (!result.success) {

                    toast.error(
                        result.message ||
                        "Failed to fetch finance data."
                    );

                    return;

                }


                // ==================================================
                // SUMMARY
                // ==================================================

                setSummary(
                    result.summary || {
                        totalFees: 0,
                        collectedFees: 0,
                        pendingFees: 0,

                        totalStudents: 0,
                        paidStudents: 0,
                        partiallyPaidStudents: 0,
                        pendingStudents: 0,

                        periodCollection: 0,
                        transactionCount: 0,
                    }
                );


                // ==================================================
                // COLLECTION TREND
                // ==================================================

                setCollectionTrend(
                    result.collectionTrend || []
                );


                // ==================================================
                // COLLECTION ACTIVITY
                // ==================================================

                setCollectionActivity(
                    result.collectionActivity || []
                );


            } catch (error) {

                console.error(
                    "FETCH PRINCIPAL FINANCE ERROR:",
                    error
                );


                toast.error(
                    error.response?.data?.message ||
                    "Failed to fetch finance data."
                );

            } finally {

    setLoading(false);

    setInitialLoading(false);

}

        },
        [
            academicYear,
            startDate,
            endDate,
        ]
    );


    // ==========================================================
    // INITIAL FETCH
    // ==========================================================

    useEffect(() => {

        fetchFinance();

    }, [fetchFinance]);


    // ==========================================================
    // FORMAT CURRENCY
    // ==========================================================

    const formatCurrency = (value) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(value || 0);

    };


    // ==========================================================
    // FORMAT DATE
    // ==========================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }


        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    // ==========================================================
    // CHART MAXIMUM
    // ==========================================================

    const chartMaximum =
        useMemo(() => {

            if (
                collectionTrend.length === 0
            ) {
                return 0;
            }


            return Math.max(
                ...collectionTrend.map(
                    item =>
                        Number(item.amount) || 0
                )
            );

        }, [
            collectionTrend,
        ]);


    // ==========================================================
    // HEATMAP MAXIMUM
    // ==========================================================

    const activityMaximum =
        useMemo(() => {

            if (
                collectionActivity.length === 0
            ) {
                return 0;
            }


            return Math.max(
                ...collectionActivity.map(
                    item =>
                        Number(item.amount) || 0
                )
            );

        }, [
            collectionActivity,
        ]);


    // ==========================================================
    // HEATMAP LEVEL
    // ==========================================================

    const getActivityLevel = (
        amount
    ) => {

        if (
            !amount ||
            activityMaximum === 0
        ) {
            return 0;
        }


        const percentage =
            amount /
            activityMaximum;


        if (percentage <= 0.25) {
            return 1;
        }

        if (percentage <= 0.5) {
            return 2;
        }

        if (percentage <= 0.75) {
            return 3;
        }

        return 4;

    };


    // ==========================================================
    // ACTIVITY MAP
    // ==========================================================

    const activityMap =
        useMemo(() => {

            const map = {};


            collectionActivity.forEach(
                item => {

                    map[item.date] =
                        item;

                }
            );


            return map;

        }, [
            collectionActivity,
        ]);


    // ==========================================================
    // HEATMAP DAYS
    // 12 WEEKS / 84 DAYS
    // ALIGNED TO MONDAY
    // ==========================================================

// ==========================================================
// MONTH CALENDAR DAYS
// ==========================================================

// ==========================================================
// HEATMAP MONTH CALENDAR
// ==========================================================

const heatmapMonthData = useMemo(() => {

    const today = new Date();

    const targetDate = new Date(
        today.getFullYear(),
        today.getMonth() +
            (heatmapMonth === "previous" ? -1 : 0),
        1
    );

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(
        year,
        month,
        1
    );

    const lastDay = new Date(
        year,
        month + 1,
        0
    );

    // Monday = 0 ... Sunday = 6
    const startingDay =
        firstDay.getDay() === 0
            ? 6
            : firstDay.getDay() - 1;

    const totalDays =
        lastDay.getDate();

    const days = [];

    // Empty cells before first day
    for (
        let i = 0;
        i < startingDay;
        i++
    ) {
        days.push(null);
    }

    // Actual dates
    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const dateKey =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        days.push({
            day,
            dateKey,
            data:
                activityMap[dateKey] || null,
        });
    }

    // Complete final week
    while (
        days.length % 7 !== 0
    ) {
        days.push(null);
    }

    return {
        year,
        month,
        days,
        label: targetDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric",
            }
        ),
    };

}, [
    heatmapMonth,
    activityMap,
]);


    // ==========================================================
    // CLEAR FILTER
    // ==========================================================

    const clearDateFilter = () => {

        setStartDate("");

        setEndDate("");

    };


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <div   ref={pageRef} className="principal-finance-page">


            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="principal-finance-page-header">

                <div className="principal-finance-title-wrapper">

                    <p className="principal-finance-eyebrow">
                        Principal
                    </p>

                    <h1 className="principal-finance-title">
                        Finance
                    </h1>

                </div>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="principal-finance-filters">

                    <div className="principal-finance-filter">

                        <label>
                            Academic Year
                        </label>

                        <select
                            value={academicYear}
                            onChange={(e) =>
                                setAcademicYear(
                                    e.target.value
                                )
                            }
                        >

                            <option value="2021-2022">
                                2021-2022
                            </option>

                            <option value="2022-2023">
                                2022-2023
                            </option>

                            <option value="2023-2024">
                                2023-2024
                            </option>

                            <option value="2024-2025">
                                2024-2025
                            </option>

                            <option value="2025-2026">
                                2025-2026
                            </option>

                            <option value="2026-2027">
                                2026-2027
                            </option>

                        </select>

                    </div>


                    <div className="principal-finance-filter">

                        <label>
                            From
                        </label>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="principal-finance-filter">

                        <label>
                            To
                        </label>

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <button
                        type="button"
                        className="principal-finance-clear-btn"
                        onClick={clearDateFilter}
                    >
                        Clear
                    </button>

                </div>

            </div>


            {/* ==================================================
                LOADING
            ================================================== */}

            {loading ? (

                <div className="principal-finance-loading">
                    Loading finance data...
                </div>

            ) : (

                <>


                    {/* ==================================================
                        TOP — THREE SUMMARY CARDS
                    ================================================== */}

                    <section className="principal-finance-summary-grid">


                        {/* ==================================================
                            CARD 1
                        ================================================== */}

                        <div className="principal-finance-stat-card">

                            <div className="principal-finance-stat-card-top">

                                <span className="principal-finance-stat-label">
                                    Total Fees
                                </span>

                            </div>

                            <div className="principal-finance-stat-card-value">

                                {formatCurrency(
                                    summary.totalFees
                                )}

                            </div>

                        </div>


                        {/* ==================================================
                            CARD 2
                        ================================================== */}

                        <div className="principal-finance-stat-card">

                            <div className="principal-finance-stat-card-top">

                                <span className="principal-finance-stat-label">
                                    Collected Fees
                                </span>

                            </div>

                            <div className="principal-finance-stat-card-value">

                                {formatCurrency(
                                    summary.collectedFees
                                )}

                            </div>

                        </div>


                        {/* ==================================================
                            CARD 3
                        ================================================== */}

                        <div className="principal-finance-stat-card">

                            <div className="principal-finance-stat-card-top">

                                <span className="principal-finance-stat-label">
                                    Pending Fees
                                </span>

                            </div>

                            <div className="principal-finance-stat-card-value">

                                {formatCurrency(
                                    summary.pendingFees
                                )}

                            </div>

                        </div>


                    </section>


                    {/* ==================================================
                        BOTTOM — TWO COLUMN GRID
                    ================================================== */}

                    <section className="principal-finance-bottom-grid">


                        {/* ==================================================
                            LEFT — COLLECTION PERFORMANCE
                        ================================================== */}

                        <div className="principal-finance-chart-section">


                            {/* ==================================================
                                CHART HEADER
                            ================================================== */}

                            {/* <div className="principal-finance-section-header">

                                <div>

                                    <p className="principal-finance-section-eyebrow">
                                        Collection
                                    </p>

                                    <h2>
                                        Collection Performance
                                    </h2>

                                </div>


                                <div className="principal-finance-period-info">

                                    <span>
                                        Period Collection
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            summary.periodCollection
                                        )}
                                    </strong>

                                </div>

                            </div> */}


                            {/* ==================================================
                                CHART
                            ================================================== */}

                            {collectionTrend.length === 0 ? (

                                <div className="principal-finance-empty">

                                    No collection data available
                                    for this period.

                                </div>

                            ) : (

                                <div className="principal-finance-chart">

                                    <div className="principal-finance-chart-bars">

{collectionTrend.map((item, index) => {

    const amount =
        Number(item.amount) || 0;

    const height =
        chartMaximum > 0
            ? Math.max(
                (amount / chartMaximum) * 100,
                8
            )
            : 8;

    const isHighest =
        amount === chartMaximum;

    return (
        <div
            className="principal-finance-chart-column"
            key={`${item.date}-${index}`}
        >

            {/* VALUE */}
            <div
                className={`principal-finance-chart-value ${
                    isHighest
                        ? "always-visible"
                        : ""
                }`}
            >
                {formatCurrency(amount)}
            </div>


            {/* BAR */}
            <div
                className={`principal-finance-chart-bar ${
                    isHighest ? "highlight" : ""
                }`}
                style={{
                    height: `${height}%`,
                }}
                title={`${formatDate(item.date)}: ${formatCurrency(amount)}`}
            />


            {/* TOOLTIP */}
            <div className="principal-finance-chart-tooltip">

                <span className="principal-finance-chart-tooltip-date">
                    {formatDate(item.date)}
                </span>

                <strong className="principal-finance-chart-tooltip-amount">
                    {formatCurrency(amount)}
                </strong>

            </div>


            {/* DATE */}
            <span className="principal-finance-chart-date">
                {new Date(item.date).toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short",
                    }
                )}
            </span>

        </div>
    );
})}

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* ==================================================
                            RIGHT — COLLECTION ACTIVITY
                        ================================================== */}

                        <div className="principal-finance-activity-section">


                            {/* ==================================================
                                ACTIVITY HEADER
                            ================================================== */}

        {/* ==================================================
    ACTIVITY HEADER
================================================== */}

{/* <div className="principal-finance-section-header">

    <div>

        <p className="principal-finance-section-eyebrow">
            Activity
        </p>

        <h2>
            Collection Activity
        </h2>

    </div>


    <div className="principal-finance-month-selector">

        <button
            type="button"
            className={
                heatmapMonth === "current"
                    ? "active"
                    : ""
            }
            onClick={() =>
                setHeatmapMonth("current")
            }
        >
            Current
        </button>

        <button
            type="button"
            className={
                heatmapMonth === "previous"
                    ? "active"
                    : ""
            }
            onClick={() =>
                setHeatmapMonth("previous")
            }
        >
            Previous
        </button>

    </div>

</div> */}


                            {/* ==================================================
                                HEATMAP
                            ================================================== */}
{/* ==================================================
    MONTH HEATMAP
================================================== */}

{/* ==================================================
    HEATMAP
================================================== */}

<div className="principal-finance-activity-wrapper">

    {/* ==================================================
        MONTH HEADER
    ================================================== */}

    <div className="principal-finance-activity-month-header">

        <div className="principal-finance-activity-month-title">
            {heatmapMonthData.label}
        </div>


        <div className="principal-finance-month-selector">

            <button
                type="button"
                className={
                    heatmapMonth === "current"
                        ? "active"
                        : ""
                }
                onClick={() =>
                    setHeatmapMonth("current")
                }
            >
                Current
            </button>


            <button
                type="button"
                className={
                    heatmapMonth === "previous"
                        ? "active"
                        : ""
                }
                onClick={() =>
                    setHeatmapMonth("previous")
                }
            >
                Previous
            </button>

        </div>

    </div>


    {/* ==================================================
        WEEKDAY LABELS
    ================================================== */}

    <div className="principal-finance-activity-weekdays">

        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>

    </div>


    {/* ==================================================
        CALENDAR GRID
    ================================================== */}

    <div className="principal-finance-activity-grid">

        {heatmapMonthData.days.map(
            (item, index) => {

                if (!item) {

                    return (
                        <div
                            key={`empty-${index}`}
                            className="principal-finance-activity-cell empty"
                        />
                    );

                }


                const amount =
                    Number(
                        item.data?.amount
                    ) || 0;


                const transactionCount =
                    Number(
                        item.data?.transactionCount
                    ) || 0;


                const students =
                    item.data?.students || [];


                const level =
                    getActivityLevel(
                        amount
                    );


                return (
                    <div
                        key={item.dateKey}
                        className={
                            `principal-finance-activity-cell level-${level}`
                        }

                        onClick={() => {

                            if (
                                students.length > 0
                            ) {
                                setSelectedHeatmapDay(
                                    item
                                );
                            }

                        }}
                    >

                        <span className="principal-finance-activity-date-number">
                            {item.day}
                        </span>


                        {/* ==================================================
                            HOVER PREVIEW
                        ================================================== */}

                        {students.length > 0 && (

                            <div className="principal-finance-activity-hover">

                                <div className="principal-finance-activity-hover-date">

                                    {formatDate(
                                        item.dateKey
                                    )}

                                </div>


                                <div className="principal-finance-activity-hover-summary">

                                    <strong>
                                        {formatCurrency(
                                            amount
                                        )}
                                    </strong>

                                    <span>
                                        {transactionCount} payment
                                        {transactionCount !== 1
                                            ? "s"
                                            : ""}
                                    </span>

                                </div>


                                <div className="principal-finance-activity-hover-students">

                                    {students
                                        .slice(0, 4)
                                        .map(
                                            (
                                                student,
                                                studentIndex
                                            ) => (

                                                <div
                                                    key={
                                                        student.studentId ||
                                                        studentIndex
                                                    }
                                                    className="principal-finance-activity-hover-student"
                                                >

                                                    <div>

                                                        <strong>
                                                            {
                                                                student.studentName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                student.department ||
                                                                "Department unavailable"
                                                            }
                                                        </span>

                                                    </div>


                                                    <b>
                                                        {formatCurrency(
                                                            Number(
                                                                student.amount
                                                            ) || 0
                                                        )}
                                                    </b>

                                                </div>

                                            )
                                        )}

                                </div>


                                {students.length > 4 && (

                                    <div className="principal-finance-activity-hover-more">

                                        +
                                        {students.length - 4}
                                        {" "}
                                        more

                                    </div>

                                )}


                                <div className="principal-finance-activity-hover-hint">

                                    Click to view details

                                </div>

                            </div>

                        )}

                    </div>
                );

            }
        )}

    </div>


    {/* ==================================================
        LEGEND
    ================================================== */}

    <div className="principal-finance-activity-legend">

        <span>Less</span>

        <i className="level-0" />
        <i className="level-1" />
        <i className="level-2" />
        <i className="level-3" />
        <i className="level-4" />

        <span>More</span>

    </div>

</div>
                        </div>


                    </section>

                </>

            )}




            {/* ==================================================
    HEATMAP PAYMENT MODAL
================================================== */}

{selectedHeatmapDay && (

    <div
        className="principal-finance-payment-modal-overlay"
    >

        <div
            className="principal-finance-payment-modal"
            onClick={(event) =>
                event.stopPropagation()
            }
        >

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="principal-finance-payment-modal-header">

                <div>

                    <span>
                        Collection Details
                    </span>

                    <h3>
                        {formatDate(
                            selectedHeatmapDay.dateKey
                        )}
                    </h3>

                </div>


                <button
                    type="button"
                    className="principal-finance-payment-modal-close"
                    onClick={() =>
                        setSelectedHeatmapDay(null)
                    }
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="principal-finance-payment-modal-summary">

                <div>

                    <span>
                        Collected
                    </span>

                    <strong>
                        {formatCurrency(
                            Number(
                                selectedHeatmapDay.data?.amount
                            ) || 0
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Payments
                    </span>

                    <strong>
                        {
                            selectedHeatmapDay.data
                                ?.transactionCount || 0
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Students
                    </span>

                    <strong>
                        {
                            selectedHeatmapDay.data
                                ?.students?.length || 0
                        }
                    </strong>

                </div>

            </div>


            {/* ==================================================
                STUDENT LIST
            ================================================== */}

            <div className="principal-finance-payment-modal-body">

                <div className="principal-finance-payment-modal-table-header">

                    <span>
                        Student
                    </span>

                    <span>
                        Department
                    </span>

                    <span>
                        Paid
                    </span>

                </div>


                <div className="principal-finance-payment-modal-students">

                    {(
                        selectedHeatmapDay.data
                            ?.students || []
                    ).map(
                        (
                            student,
                            index
                        ) => (

                            <div
                                key={
                                    student.studentId ||
                                    index
                                }
                                className="principal-finance-payment-modal-student"
                            >

                                <div>

                                    <strong>
                                        {
                                            student.studentName ||
                                            "Unknown Student"
                                        }
                                    </strong>

                                    <small>
                                        {
                                            student.registerNumber ||
                                            "—"
                                        }
                                    </small>

                                </div>


                                <span>
                                    {
                                        student.department ||
                                        "—"
                                    }
                                </span>


                                <b>
                                    {formatCurrency(
                                        Number(
                                            student.amount
                                        ) || 0
                                    )}
                                </b>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* ==================================================
                MODAL FOOTER
            ================================================== */}

            <div className="principal-finance-payment-modal-footer">

                <button
                    type="button"
                    onClick={() =>
                        setSelectedHeatmapDay(null)
                    }
                >
                    Cancel
                </button>

            </div>

        </div>

    </div>

)}

        </div>

    );

};


export default PrincipalFinancePage;