import { useState, memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import axiosInstance from "../../../utils/axiosInstance";
import AlertMessages from "../../../components/AlertMessages";
import { useRouter } from "next/router";
import Signature from "../../../components/Signature";
import { useSignatureStore } from "../../../store/signature";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

const QuestionWithChoices = memo(function QuestionWithChoices(props) {

    const { no, state, setState, register, onClickHandleChecks, name } = props

    return (
        <div className="mt-5">
            {no}. {state.question}
            <div className="mt-3">
                {state.choices.map((q, i) => (
                    <div key={i} 
                        className="flex items-center gap-3 ml-5 px-3">
                        <input
                            style={{width: '15px', height: '15px'}}
                            onClick={() => onClickHandleChecks(i, setState)}
                            value={q.value}
                            checked={q.checked || ''}
                            {...register(name)}
                            type="checkbox"
                        />
                        <div>{q.text}</div>
                    </div>
                ))}
            </div>
        </div>
    )
})

const CustomerSurveySchema = yup.object().shape({
	q1:  yup.array().min(1, "This field is required."),
	q2:  yup.array().min(1, "This field is required."),
	q3:  yup.array().min(1, "This field is required."),
	q4: yup.number().typeError('This field is required')
                .min(0, "Must be greater than 0")
                .max(5, "Must be less than or equal to 5"),
	customer_name: yup.string().required('This field is required')
		.max(100, "Only 100 characters is allowed."),
});

export default function CustomerSurvey() {
	const signatureStore = useSignatureStore();
	const [isAddingSignature, setIsAddingSignature] = useState(false);
    const [Q4Answer, setQ4Answer] = useState('');
    const [Q5Answer, setQ5Answer] = useState('');
    const [Q6Answer, setQ6Answer] = useState('No');
    const [disableSubmit, setDisableSubmit] = useState(true);
    
	const [isImageEmpty, setIsImageEmpty] = useState(false);

    const Q5Choices = ['Comment', 'Question', 'Concern']

    const { user } = useAuth();
	const router = useRouter();
	const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
        defaultValues: {
            q1: [],
            q2: [],
            q3: [],
            q5: '',
            q6: ''
        },
		mode: 'onSubmit',
		resolver: yupResolver(CustomerSurveySchema)
	})

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    const [q1, setQ1] = useState({
        question: 'Overall, how would you rate the quality of your customer service experience',
        choices: [
            { value: 'VERYPOSITIVE', text: 'Very Positive', checked: false },
            { value: 'SOMEWHATPOSITIVE', text: 'Somewhat Positive', checked: false },
            { value: 'NEUTRAL', text: 'Negative', checked: false },
            { value: 'SOMEWHATNEGATIVE', text: 'Somewhat Negative', checked: false },
            { value: 'VERYNEGATIVE', text: 'Very Negative', checked: false },
        ]
    })
    const [q2, setQ2] = useState({
        question: 'How well we understand and address your questions and concerns?',
        choices: [
            { value: 'EXTREMELYWELL', text: 'Extremely Well', checked: false },
            { value: 'VERYWELL', text: 'Very well', checked: false },
            { value: 'SOMEWHATWELL', text: 'Somewhat Well', checked: false },
            { value: 'NOTSOWELL', text: 'Not So Well', checked: false },
            { value: 'NOTATALLWELL', text: 'Not at all well', checked: false },
        ]
    })
    const [q3, setQ3] = useState({
        question: 'How much time did it take us to address your questions and concerns?',
        choices: [
            { value: 'MUCHSHORTERTHANEXPECTED', text: 'Much shorter than expected', checked: false },
            { value: 'ABOUTWHATIEXPECT', text: 'About what I expected', checked: false },
            { value: 'SHORTERTHANEXPECTED', text: 'Shorter than expected', checked: false },
            { value: 'LONGERTHANIEXPECTED', text: 'Longer than I expected', checked: false },
            { value: 'MUCHLONGERTHANIEXPECTED', text: 'Much longer than I expected', checked: false },
        ]
    })
    const q = {
        q4: {
            main: 'How likely is it that you would recommend our company/product/services to a friend or colleagues?',
            sub: 'Rate us between 1 to 5, wherein 5 is the Highest and 1 is the Lowest:'
        },
        q5: 'Do you have any other comments, question or concerns?',
        q6: 'Do you know the name of the person who assisted you',
    }

    function onSubmit(data) {
		if(!signatureStore.image){
			setIsImageEmpty(true);
            return;
        }
        let q1i = -1, q2i = -1, q3i = -1;
        let index = 5
        for(let i = 0; i < 5; i++){
            if(q1.choices[i].value === data['q1'][0])
                q1i = index;
            if(q2.choices[i].value === data['q2'][0])
                q2i = index;
            if(q3.choices[i].value === data['q3'][0])
                q3i = index;
            index--;
        }
        data = {
            ...data,
            q1: data['q1'][0],
            q2: data['q2'][0],
            q3: data['q3'][0],
            q5: Q5Answer+(data.q5 != '' ? `, ${data.q5}` : ''),
            q6: Q6Answer+(data.q6 != '' ? `, ${data.q6}` : ''),
            q1_score: q1i,
            q2_score: q2i,
            q3_score: q3i,
            signature: signatureStore.image,
        }
        console.log(data)
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Saving Feedback.' 
		})
        axiosInstance.post('employee/customer-rating/', data)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Feedback Saved.' 
            })
            reset();
            let qq1 = {...q1}
            let qq2 = {...q2}
            let qq3 = {...q3}
            for(let i = 0; i < 5; i++){
                qq1.choices[i].checked = false;
                qq2.choices[i].checked = false;
                qq3.choices[i].checked = false;
                index--;
            }
            setQ1(qq1);
            setQ2(qq2);
            setQ3(qq3);
            signatureStore.emtpyImage()
            if(typeof window !== 'undefined' && localStorage.getItem(`${user?.id}-rating`) != null){
                localStorage.removeItem(`${user?.id}-rating`);
            }
            setDisableSubmit(true)
            setQ4Answer('')
            setQ5Answer('')
            setQ6Answer('No')
        }).catch((_e) => {
            setStatus({ 
                error: true, 
                success: false, 
                loading: false, 
                infoMessage: 'Something went wrong.' 
            })
        })
    }

	useEffect(() => {
		if(signatureStore.image){
			setIsImageEmpty(false);
		}
	}, [signatureStore.image])

    const onClickHandleChecks = useCallback((index, setState) => {
        setState(prevState => ({
            question: prevState.question,
            choices: prevState.choices.map((q, i) => 
                i === index ? {...q, checked: true} : {...q, checked: false}
            )
        }))
    }, [])

    useState(()=>{
		function checkLocalStorage(){
			if(typeof window !== 'undefined' && localStorage.getItem(`${user?.id}-rating`) != null){
				var data = localStorage.getItem(`${user?.id}-rating`)
                data = JSON.parse(data)
				setValue('customer_name', data.customer_name)
                setDisableSubmit(false)
			}else{
				console.log('no data')
			}
		}
		checkLocalStorage()
	},[user])

    return(
        <div className="bg-white min-h-screen">
            <div className="max-w-[900px] m-auto pt-10 px-5">
                {isAddingSignature ? (
                    <Signature setIsAddingSignature={setIsAddingSignature}/>
                ): (
                    <form onSubmit={handleSubmit(onSubmit)} className="pb-5">
                        <div className="overflow-hidden shadow-lg sm:rounded-md">
                            <div className="space-y-6 bg-white md:px-10 px-4 py-5 sm:p-6">
                                <div className="text-lg font-medium text-gray-900" aria-hidden="true">
                                    <button 
                                        type="button"
                                        className="text-blue-500 !font-normal mb-2"
                                        onClick={() => router.push('/e')}
                                    >
                                        Back
                                    </button>
                                    <div>
                                        Customer FeedbackForm
                                    </div>
                                </div>
                                <div className="text-[16px]">
                                    At First Philippines Scales, we makesure customers come first. Let us know how we are
                                    doing and how we can serve you better. Please rate us on the degree of which
                                    you agree or disagree based on your experience with them.
                                </div>
                                <QuestionWithChoices
                                    no="1"
                                    state={q1}
                                    setState={setQ1}
                                    register={register}
                                    name="q1"
                                    onClickHandleChecks={onClickHandleChecks}
                                />
                                <div className="text-red-500">{errors?.q1 && errors?.q1?.message}</div>
                                <QuestionWithChoices
                                    no="2"
                                    state={q2}
                                    setState={setQ2}
                                    register={register}
                                    name="q2"
                                    onClickHandleChecks={onClickHandleChecks}
                                />
                                <div className="text-red-500">{errors?.q2 && errors?.q2?.message}</div>
                                <QuestionWithChoices
                                    no="3"
                                    state={q3}
                                    setState={setQ3}
                                    register={register}
                                    name="q3"
                                    onClickHandleChecks={onClickHandleChecks}
                                />
                                <div className="text-red-500">{errors?.q3 && errors?.q3?.message}</div>
                                <div className="mt-5">
                                    <div>4. {q.q4.main}</div>
                                    <div className="px-5">
                                        <div className="ml-4">{q.q4.sub}</div>
                                        {
                                           [...Array(5)].map((elementInArray, index) => ( 
                                            <div>
                                                <input
                                                    style={{width: '15px', height: '15px'}}
                                                    className="ml-5 mr-2"
                                                    {...register('q4')}
                                                    onChange={(event) => {
                                                        setQ4Answer(index+1)
                                                        setValue('q4',(index+1))
                                                    }}
                                                    value={index+1}
                                                    checked={Q4Answer == (index+1)}
                                                    type="checkbox"
                                                /><label>{index+1}</label>
                                            </div>
                                        )) 
                                        }

                                        {/* <input type="text" 
                                            autoComplete="off"
                                            {...register('q4')} 
                                            className="input max-w-[100px] ml-10" /> */}
                                    </div>
                                </div>
                                <div className="text-red-500">{errors?.q4 && errors?.q4?.message}</div>
                                <div className="mt-5">
                                    <div>5. {q.q5}</div>
                                    <div className="px-5">
                                        {
                                            Q5Choices.map((choice, index) => (
                                            <div>
                                                <input
                                                    style={{width: '15px', height: '15px'}}
                                                    className="ml-5 mr-2"
                                                    onChange={(event) => setQ5Answer(choice)}
                                                    value={choice}
                                                    checked={Q5Answer == (choice)}
                                                    type="checkbox"
                                                /><label>{choice}</label>
                                            </div> 
                                            ))
                                        }
                                        <textarea 
                                            name="" 
                                            id="" 
                                            {...register('q5')} 
                                            className={Q5Answer != '' ? "text-area" : "hidden" }
                                            rows="2"
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div>6. {q.q6}?</div>
                                    <select
                                            id='q4'
                                            className='w-[100px] ml-5 border rounded-[5px] text-left pl-3 mt-2'
                                            defaultValue={'No'}
                                            onChange = {(event)=> setQ6Answer(event.target.value)}
                                            // {...register('q6')} 
                                        >
                                            <option key = {1} value={'Yes'}>Yes</option>
                                            <option key = {2} value={'No'}>No</option>
                                        </select>
                                    <div className="px-5">
                                        <input 
                                            type="text" 
                                            {...register('q6')}
                                            className={Q6Answer === 'Yes' ? "input" : "hidden" } />
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="pl-5">Customer name</div>
                                    <div className="px-5">
                                        <input 
											autoComplete="off"
                                            type="text" 
                                            {...register('customer_name')}
                                            className="input" />
                                    </div>
                                    <div className="text-red-500 pl-5">{errors?.customer_name && errors?.customer_name?.message}</div>
                                </div>
                                <div className="px-6">
                                    <div className={`border border-indigo-600 rounded-lg max-w-[600px] mt-10 ${!signatureStore.image? 'p-4': ''}`}>
                                        {signatureStore.image ? (
                                            <img src={signatureStore.image} 
                                                height={signatureStore.h} 
                                                width={signatureStore.w} />
                                        ): 'No signature yet'}
                                    </div>
                                    <div className="text-red-500">{isImageEmpty && 'Signature is required.'}</div>
                                    <div className="mt-5">
                                        <button 
                                                type="button"
                                                className="btn btn-primary" 
                                                onClick={() => setIsAddingSignature(true)}> 
                                            {signatureStore.image ? 'Update Signature' : 'Add Signature'}
                                        </button>
                                    </div>

                                    <AlertMessages
                                        error={status.error}
                                        success={status.success}
                                        loading={status.loading}
                                        message={status.infoMessage}
                                        className="mt-5"
                                    />
                                </div>
                            </div>


                            <div className="bg-gray-50 md:px-10 px-4 py-5 text-right flex justify-end items-center gap-3">
                                <button
                                    type="submit"
                                    className={disableSubmit ? 'btn' : "btn btn-primary"}
                                    disabled={disableSubmit}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}