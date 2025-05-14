import React from "react";
import { useCvStore } from "../../../../Store";
import TextInputField from "../../../UI/textInputField";

const PersonalInfos: React.FC = () => {

    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        birthDate,
        socialLinks,
        setFirstName,
        setLastName,
        setEmail,
        setPhoneNumber,
        setAddress,
        setBirthDate,
        addSocialLink,
        updateSocialLink,
        removeSocialLink,
    } = useCvStore();

    return (
        <>
            <div className="font-sans w-auto">
                <h2 className="text-xl text-gray-600 font-bold mb-6">Personal Information</h2>
                <div className="flex flex-col gap-x-8 gap-y-5 md:grid grid-cols-2">
        
                    <TextInputField 
                        id="firstName" 
                        label="First Name:" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="e.g. John" 
                    />
                    
                    <TextInputField 
                        id="lastName" 
                        label="Last Name:" 
                        value={lastName} onChange={(e) => setLastName(e.target.value)} 
                        placeholder="e.g. Doe" 
                    />

                    <TextInputField 
                        id="email" 
                        type="email" 
                        label="Email:"
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                        placeholder="e.g. e.g. john.doe@gmail.com" 
                    />

                    <TextInputField
                        id="phoneNumber" 
                        type="tel" 
                        label="Phone Number:" 
                        value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} 
                        placeholder="e.g. (+33) 6 1234 5678" 
                    />
                    
                    <TextInputField
                        id="address" 
                        label="Address:" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        placeholder="e.g. 123 St, City, Country" 
                    />

                    <TextInputField
                        type="date"
                        id="birthDate" 
                        label="Birth Date:" 
                        value={new Date(birthDate).toISOString().slice(0, 10)} 
                        onChange={(e) => setBirthDate(new Date(e.target.value))} 
                        placeholder="e.g. 15/09/1983" 
                    />
        
                    <div className="col-span-2 flex flex-col space-y1 w-full mt-2">
                        <label className="text-lg text-gray-600 font-bold">Social Links</label>
                        <p className="text-sm text-gray-500 mb-4e">Add your social media links (e.g. LinkedIn, GitHub, etc.)</p>
                        <div className="flex flex-col content-start gap-x-8 gap-y-5 mt-3">
                            {
                                socialLinks.map((link) => (
                                    <div key={link.id} className="border rounded-lg p-5 border-gray-300 shadow-sm flex flex-col gap-x-8 gap-y-3 font-sans md:grid grid-cols-2">
                                        <div className="flex items-center justify-between col-span-2">
                                            <span className="text-lg font-medium text-gray-700">{link.platform == '' ? 'Untitled' : link.platform }</span>
                                            <button onClick={() => removeSocialLink(link.id)}><span className="text-red-500 hover:cursor-pointer">del</span></button>
                                        </div>

                                        <TextInputField
                                            id={`platform-${link.id}`}
                                            label="Platform:"
                                            placeholder="e.g. LinkedIn"
                                            value={link.platform}
                                            onChange={(e) => updateSocialLink(link.id, { platform: e.target.value })}
                                        />
                                        <TextInputField
                                            id={`url-${link.id}`}
                                            label="URL:"
                                            placeholder="e.g. https://linkedin.com/johndoe"
                                            value={link.url}
                                            onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                                        />
                                    </div>
                                ))
                            }
                            <button onClick={() => addSocialLink({ platform: '', url: '' })} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                                + Add social link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
    

} 

export default PersonalInfos;