require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
  res.sendFile('./index.html');
});

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

// Store conversation history and user state per session
const sessionHistory = {};
const userState = {};
const formSubmissions = [];

// Comprehensive product database
const PRODUCTS = [
  // EXTRUDERS - SINGLE LAYER
  {
    id: "ex-35",
    name: "Extruder Single Layer EX-35",
    category: "Extruders",
    subcategory: "Single Layer",
    description: "Precision single layer extruder with 35mm screw size for household wires and cables",
    output: "30 kg/hr",
    applications: "Household wires, insulation coating",
    specs: "35mm screw | 30 kg/hr output | PID smart sensing"
  },
  {
    id: "ex-50",
    name: "Extruder Single Layer EX-50",
    category: "Extruders",
    subcategory: "Single Layer",
    description: "Mid-range single layer extruder for medium voltage cables and diverse applications",
    output: "75 kg/hr",
    applications: "Medium voltage cables, Sioplas HV cables",
    specs: "50mm screw | 75 kg/hr output | Multiple compression ratios"
  },
  {
    id: "ex-100",
    name: "Extruder Single Layer EX-100",
    category: "Extruders",
    subcategory: "Single Layer",
    description: "High-capacity single layer extruder for industrial cable production",
    output: "400 kg/hr",
    applications: "Power cables, industrial insulation",
    specs: "100mm screw | 400 kg/hr output | Advanced heating system"
  },
  {
    id: "ex-150",
    name: "Extruder Single Layer EX-150",
    category: "Extruders",
    subcategory: "Single Layer",
    description: "Maximum capacity single layer extruder for heavy-duty production lines",
    output: "800 kg/hr",
    applications: "Large diameter cables, mass production",
    specs: "150mm screw | 800 kg/hr output | PLC/HMI control"
  },
  {
    id: "ex-dual-50-35",
    name: "Dual Layer Extruder (50-35)",
    category: "Extruders",
    subcategory: "Dual Layer",
    description: "Dual layer system with bi-color capability for multi-coat insulation",
    output: "80 kg/hr",
    applications: "Dual insulation cables, multi-color sheathing",
    specs: "50mm + 35mm screws | 80 kg/hr combined output"
  },
  {
    id: "ex-dual-100-65",
    name: "Dual Layer Extruder (100-65)",
    category: "Extruders",
    subcategory: "Dual Layer",
    description: "High-capacity dual layer system for advanced cable production",
    output: "450 kg/hr",
    applications: "Complex cable structures, power cables",
    specs: "100mm + 65mm screws | 450 kg/hr combined output"
  },
  {
    id: "ex-triple-100-80-60",
    name: "Triple Layer Extruder (100-80-60)",
    category: "Extruders",
    subcategory: "Triple Layer",
    description: "Advanced triple extrusion for complex multi-layer cable designs",
    output: "560 kg/hr",
    applications: "Multi-layer power cables, specialty cables",
    specs: "Triple extrusion | 560 kg/hr output | Full automation"
  },
  {
    id: "line-wire-cable",
    name: "Wire & Cable Extrusion Line Complete",
    category: "Complete Lines",
    description: "Integrated cable manufacturing system with extrusion, cooling, caterpillar, capstan, and take-up",
    output: "Variable based on extruder",
    applications: "Complete cable production from raw to finished",
    specs: "Full line setup | Customizable configuration | Energy efficient"
  },
  {
    id: "line-electric-cable",
    name: "Electric Cable Manufacturing Plant",
    category: "Complete Lines",
    description: "Specialized complete solution for electric cable production",
    output: "High capacity",
    applications: "Electric power cables for distribution",
    specs: "Electric specific features | Advanced controls"
  },
  {
    id: "line-house-wire",
    name: "House Wire Cable Production Line",
    category: "Complete Lines",
    description: "Cost-effective complete line for household building wire production",
    output: "Standard capacity",
    applications: "Household wiring, residential cables",
    specs: "Optimized efficiency | Standard output"
  },
  {
    id: "line-power-cable",
    name: "Power Cable Manufacturing Plant",
    category: "Complete Lines",
    description: "Heavy-duty complete system for high-capacity power cable production",
    output: "High capacity",
    applications: "Heavy-duty power cables, transmission lines",
    specs: "Industrial grade | Advanced monitoring"
  },
  {
    id: "line-submersible",
    name: "Submersible Cable Manufacturing Plant",
    category: "Complete Lines",
    description: "Specialized complete setup for submersible cable with enhanced insulation",
    output: "Medium to high capacity",
    applications: "Submersible pump cables, water-resistant applications",
    specs: "Water-resistant design | Enhanced insulation"
  },
  {
    id: "caterpillar-6",
    name: "Caterpillar SCT-6 (3+3 Cylinder)",
    category: "Support Systems",
    subcategory: "Pullers",
    description: "Precision 6-cylinder caterpillar for smooth cable pulling with variable speeds",
    output: "20-100 mtr/min",
    applications: "Cable pulling, wire drawing",
    specs: "6 cylinder | Wire OD: 25mm | Speed control"
  },
  {
    id: "caterpillar-10",
    name: "Caterpillar SCT-10 (5+5 Cylinder)",
    category: "Support Systems",
    subcategory: "Pullers",
    description: "Mid-range caterpillar puller for standard to medium-sized cables",
    output: "40-80 mtr/min",
    applications: "Standard cable production",
    specs: "10 cylinder | Wire OD: 60mm | Synchronization control"
  },
  {
    id: "caterpillar-14",
    name: "Caterpillar SCT-14 (7+7 Cylinder)",
    category: "Support Systems",
    subcategory: "Pullers",
    description: "High-capacity caterpillar puller for large diameter cables",
    output: "40 mtr/min",
    applications: "Large diameter cables, power cables",
    specs: "14 cylinder | Wire OD: 100mm | Motorized sync"
  },
  {
    id: "capstan-400",
    name: "Capstan Machine SCP-400",
    category: "Support Systems",
    subcategory: "Capstans",
    description: "Compact capstan for fine wire control and speed adjustment",
    output: "450 mtr/min",
    applications: "Fine wires, speed control",
    specs: "400mm diameter | 0.5-3.0mm wire OD | 3 H.P. motor"
  },
  {
    id: "capstan-600",
    name: "Capstan Machine SCP-600",
    category: "Support Systems",
    subcategory: "Capstans",
    description: "Standard capstan for medium cable production with precision speed control",
    output: "350 mtr/min",
    applications: "Standard cables, speed regulation",
    specs: "600mm diameter | 2.5-16mm wire OD | 5 H.P. motor"
  },
  {
    id: "payoff-portal",
    name: "Pay-Off Machine - Portal Type",
    category: "Support Systems",
    subcategory: "Pay-Offs",
    description: "Portal type self-traversing pay-off for flexible bobbin accommodation",
    output: "50-500 mtr/min",
    applications: "Flexible bobbin payoff, custom diameters",
    specs: "400-3100mm bobbin dia | Multiple motor options"
  },
  {
    id: "payoff-cone",
    name: "Pay-Off Machine - Cone Type",
    category: "Support Systems",
    subcategory: "Pay-Offs",
    description: "Cone type pay-off for standard bobbin sizes with manual operation",
    output: "Variable",
    applications: "Standard wire bobbins",
    specs: "Cone type | Manual operation available"
  },
  {
    id: "takeup-portal",
    name: "Take-Up Machine - Portal Type STU-630",
    category: "Support Systems",
    subcategory: "Take-Ups",
    description: "Portal type self-traversing take-up for flexible cable winding",
    output: "300-400 mtr/min",
    applications: "Standard cables, finished product winding",
    specs: "630mm bobbin | Column shifting | Tension control"
  },
  {
    id: "takeup-column",
    name: "Take-Up Machine - Column Shifting STU-1000",
    category: "Support Systems",
    subcategory: "Take-Ups",
    description: "Column shifting take-up for precision winding of finished cables",
    output: "300-250 mtr/min",
    applications: "Cable winding, product packaging",
    specs: "1000mm bobbin | 7.5 H.P. motor | Dual options"
  },
  {
    id: "takeup-dual",
    name: "Dual Take-Up Machine STU-1400",
    category: "Support Systems",
    subcategory: "Take-Ups",
    description: "Dual take-up system for high-speed dual-cable production",
    output: "300-200 mtr/min",
    applications: "Twin cable production, high efficiency",
    specs: "1400mm dual bobbins | 7.5 H.P. motors"
  },
  {
    id: "water-trough-multipass",
    name: "Water Trough - Multipass Type",
    category: "Support Systems",
    subcategory: "Cooling",
    description: "Multi-pass cooling trough for efficient cable insulation cooling",
    output: "Continuous cooling",
    applications: "Insulation cooling, temperature control",
    specs: "Multipass design | Adjustable depth | Multiple sizes"
  },
  {
    id: "water-trough-open",
    name: "Water Trough - Open View Type",
    category: "Support Systems",
    subcategory: "Cooling",
    description: "Open view water trough for easy cable monitoring during cooling",
    output: "Continuous cooling",
    applications: "Large diameter cables, visual inspection",
    specs: "Open design | Large bobbin support"
  },
  {
    id: "crosshead-sch-25",
    name: "Cross Head SCH-25/35",
    category: "Components",
    subcategory: "Cross Heads",
    description: "Self-centering cross head for 25mm wire with dual/single insulation",
    output: "Varies with extruder",
    applications: "Standard cable insulation",
    specs: "Wire OD: 22mm | Cable OD: 30mm | Auto centering"
  },
  {
    id: "crosshead-sch-50",
    name: "Cross Head SCH-50/60",
    category: "Components",
    subcategory: "Cross Heads",
    description: "Mid-range cross head with die-centering for larger cables",
    output: "Varies with extruder",
    applications: "Medium to large cables",
    specs: "Wire OD: 50mm | Cable OD: 56mm | Die centered"
  },
  {
    id: "crosshead-sch-100",
    name: "Cross Head SCH-100/125",
    category: "Components",
    subcategory: "Cross Heads",
    description: "Heavy-duty cross head for large diameter power cable insulation",
    output: "Varies with extruder",
    applications: "Power cables, large diameter applications",
    specs: "Wire OD: 115mm | Cable OD: 125mm | Die centered"
  },
  {
    id: "screw-bm-single",
    name: "Screw & Barrel BM Type Single",
    category: "Components",
    subcategory: "Screws & Barrels",
    description: "BM type single thread screw for various cable compounds with custom compression",
    output: "Customized based on design",
    applications: "Flexible compound extrusion",
    specs: "Multiple compression ratios | Mirror finish | All compounds compatible"
  },
  {
    id: "screw-single-thread",
    name: "Screw & Barrel Single Thread Type",
    category: "Components",
    subcategory: "Screws & Barrels",
    description: "Single thread precision screw for high-speed extrusion",
    output: "High throughput",
    applications: "High-speed cable extrusion",
    specs: "Precision machined | Grooved feeding zones"
  },
  {
    id: "rewinding-line",
    name: "Rewinding Line Complete",
    category: "Auxiliary Equipment",
    description: "Automated rewinding system for finished cable processing",
    output: "High-speed operation",
    applications: "Cable reprocessing, packaging",
    specs: "Portal or column type | PLC automation available"
  },
  {
    id: "coiling-auto",
    name: "Coiling Machine - Fully Automatic",
    category: "Auxiliary Equipment",
    description: "Fully automatic coiling with PLC control for consistent cable coiling",
    output: "High speed",
    applications: "Production-scale coiling",
    specs: "PLC control | Multiple size options | Auto tension"
  },
  {
    id: "coiling-semi",
    name: "Coiling Machine - Semi-Automatic",
    category: "Auxiliary Equipment",
    description: "Semi-automatic coiling machine for flexible production",
    output: "Medium speed",
    applications: "Custom cable coiling, small batches",
    specs: "Manual control options | Compact design"
  },
  {
    id: "drive-panel-plc",
    name: "Drive & Heating Panel - PLC/HMI",
    category: "Control Systems",
    description: "Advanced PLC/HMI control panel for complete extrusion system automation",
    output: "All machine control",
    applications: "Full system automation",
    specs: "PLC/HMI touchscreen | Precision temperature | AC cooling"
  },
  {
    id: "drive-panel-analog",
    name: "Drive & Heating Panel - Analog",
    category: "Control Systems",
    description: "Traditional analog control panel for straightforward machine operation",
    output: "All machine control",
    applications: "Standard machine operation",
    specs: "Analog controls | Reliable operation | Cost-effective"
  },
  {
    id: "wire-straightener",
    name: "Wire Straightener",
    category: "Support Systems",
    subcategory: "Accessories",
    description: "Precision wire straightening equipment for cable production lines",
    output: "Multiple wire sizes",
    applications: "Wire preparation, straightening",
    specs: "Motorized system | High precision | Adjustable"
  },
  {
    id: "high-speed-mixer",
    name: "High Speed Mixer for Compounds",
    category: "Auxiliary Equipment",
    description: "Powder and compound mixing system for consistent material preparation",
    output: "Batch processing",
    applications: "Compound preparation, mixing",
    specs: "PLC control | Multiple sizes | Precision timing"
  },
  {
    id: "dancer-accumulator",
    name: "Dancer & Accumulator System",
    category: "Support Systems",
    subcategory: "Accessories",
    description: "Tension control system for smooth cable operation",
    output: "Tension regulation",
    applications: "Tension control, speed variation",
    specs: "Motorized options | Precision control"
  }
];

const INIT_OPTIONS = [
  { label: "Schedule a Factory Visit", emoji: "🏭" },
  { label: "Book an Appointment", emoji: "📅" },
  { label: "Our Products", emoji: "⚙️" },
  { label: "Get a Quote", emoji: "📋" }
];

const COMPANY_INFO = {
  name: "Saini Engineering Industries",
  owner: "Ajeet Singh Saini",
  cmo: "Harshdeep Singh Saini",
  phone: "+91-9810175603",
  landline: "0120-4131053",
  email: "info@sainiengineering.com",
  address: "4/19, Site-IV Industrial Area, Sahibabad, Ghaziabad, UP-201010",
  hours: "Monday to Saturday, 9 AM to 6 PM IST",
  website: "https://www.sainiengineering.com"
};

app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId, turnCount } = req.body;

    // Initialize session if new
    if (!sessionHistory[sessionId]) {
      sessionHistory[sessionId] = [];
      userState[sessionId] = {
        currentFlow: null,
        messageCount: 0
      };
    }

    const state = userState[sessionId];
    state.messageCount = turnCount;

    // Add user message to history
    sessionHistory[sessionId].push({
      role: "user",
      content: message
    });

    // Detect flow from user input
    if (!state.currentFlow && turnCount === 1) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("factory") || lowerMsg.includes("visit")) {
        state.currentFlow = "factory_visit";
      } else if (lowerMsg.includes("appointment") || lowerMsg.includes("book")) {
        state.currentFlow = "appointment";
      } else if (lowerMsg.includes("product") || lowerMsg.includes("machinery")) {
        state.currentFlow = "products";
      } else if (lowerMsg.includes("quote") || lowerMsg.includes("quotation")) {
        state.currentFlow = "quotation";
      }
    }

    // Build system prompt based on current flow
    let systemPrompt = getSystemPrompt(state);

    // Build messages array with conversation history
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...sessionHistory[sessionId]
    ];

    // Get AI response from OpenAI (FIXED: using gpt-4o-mini)
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const assistantReply = response.choices[0].message.content;

    // Add assistant message to history
    sessionHistory[sessionId].push({
      role: "assistant",
      content: assistantReply
    });

    // Prepare response object
    let responseData = {
      reply: assistantReply,
      showInitOptions: turnCount === 0,
      initOptions: INIT_OPTIONS,
      showForm: false,
      formType: null,
      currentFlow: state.currentFlow,
      products: null
    };

    // Handle products list display
    if ((state.currentFlow === "products" || message.toLowerCase().includes("product")) && 
        turnCount >= 1) {
      const productsByCategory = {};
      PRODUCTS.forEach(p => {
        if (!productsByCategory[p.category]) {
          productsByCategory[p.category] = [];
        }
        productsByCategory[p.category].push({
          id: p.id,
          name: p.name,
          description: p.description,
          specs: p.specs
        });
      });
      responseData.products = productsByCategory;
    }

    // Handle form display for factory visit and appointments
    if ((state.currentFlow === "factory_visit" || state.currentFlow === "appointment") && 
        turnCount >= 2) {
      responseData.showForm = true;
      responseData.formType = state.currentFlow === "factory_visit" ? "visit_form" : "appointment_form";
    }

    // Handle form display for quotations
    if (state.currentFlow === "quotation" && turnCount >= 2) {
      responseData.showForm = true;
      responseData.formType = "quotation_form";
    }

    res.json(responseData);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Something went wrong",
      reply: "I apologize for the inconvenience. Please try again or contact us directly at +91-9810175603."
    });
  }
});

app.post("/submit-form", async (req, res) => {
  try {
    const { formType, data, sessionId } = req.body;

    // Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields"
      });
    }

    // Store form submission
    const submission = {
      type: formType,
      ...data,
      timestamp: new Date().toLocaleString(),
      sessionId: sessionId
    };
    formSubmissions.push(submission);

    let confirmationMessage = "";
    let emailSubject = "";
    let emailBody = "";

    if (formType === "visit_form" || formType === "appointment_form") {
      confirmationMessage = `Thank you, ${data.name}! Your ${formType === "visit_form" ? "factory visit" : "appointment"} request has been confirmed. Our CMO, Harshdeep Singh Saini, will contact you within 24 hours at ${data.phone} to reconfirm your booking.`;
      
      emailSubject = `New ${formType === "visit_form" ? "Factory Visit" : "Appointment"} Request from ${data.name}`;
      emailBody = `
New ${formType === "visit_form" ? "Factory Visit" : "Appointment"} Request:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Company: ${data.company || 'N/A'}
Date: ${data.date || 'N/A'}
Time: ${data.time || 'N/A'}
${formType === "visit_form" ? `GST: ${data.gst || 'N/A'}` : ''}
${formType === "visit_form" ? `Focus: ${data.focus || 'N/A'}` : `Type: ${data.type || 'N/A'}`}
${data.notes ? `Notes: ${data.notes}` : ''}

Timestamp: ${submission.timestamp}
      `;
    } else if (formType === "quotation_form") {
      confirmationMessage = `Thank you, ${data.name}! Your quotation request has been received. Mr. Ajeet Singh Saini will get in touch with you within 24 hours at ${data.phone} with a customized quotation based on your requirements.`;
      
      emailSubject = `New Quotation Request from ${data.name}`;
      emailBody = `
New Quotation Request:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Company: ${data.company || 'N/A'}
GST: ${data.gst || 'N/A'}
Product: ${data.product || 'N/A'}
Details: ${data.details || 'N/A'}

Timestamp: ${submission.timestamp}
      `;
    }

    // Send email to dad
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.DAD_EMAIL,
      subject: emailSubject,
      text: emailBody
    });

    res.json({
      success: true,
      message: confirmationMessage,
      submittedData: data
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting form"
    });
  }
});

// API endpoint to get all products
app.get("/api/products", (req, res) => {
  res.json(PRODUCTS);
});

// API endpoint to get product by ID
app.get("/api/products/:id", (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Get all form submissions (for debugging)
app.get("/api/submissions", (req, res) => {
  res.json(formSubmissions);
});

function getSystemPrompt(state) {
  let basePrompt = `You are SEI AI, the official conversational assistant for Saini Engineering Industries, powered by Aura AI.

COMPANY INFORMATION:
Name: Saini Engineering Industries
Owner: Mr. Ajeet Singh Saini
CMO: Harshdeep Singh Saini
ISO Certification: ISO 9001:2015
Founded: 1978 (47+ years of expertise)
Factory Area: 40,000+ sq. ft.
Team: 120+ skilled engineers and professionals
Installed Machines Globally: 1000+
Status: Leading Cable Extrusion Machinery Manufacturer

CONTACT DETAILS:
Phone: +91-9810175603 | Landline: 0120-4131053
Email: info@sainiengineering.com | sainiengg@yahoo.co.in
Address: 4/19, Site-IV Industrial Area, Sahibabad, Ghaziabad, UP-201010
Website: https://www.sainiengineering.com
Hours: Monday to Saturday, 9 AM to 6 PM IST

GLOBAL PRESENCE:
Exporting to 20+ countries including UAE, Bangladesh, Nepal, Nigeria, Kenya, Zambia, Botswana, Brazil, Iran, Syria, Malaysia, Sri Lanka and more.

CORE VALUES:
- Quality: Highest standards in every product
- Excellence: Exceptional service and experiences
- Guarantee: Unconditional guarantee against defects
- Development: Continuous process improvement
- Resourcefulness: Solution-oriented approach to challenges

CONVERSATION STYLE - CRITICAL:
1. Be genuinely helpful, warm, and professional
2. NEVER be repetitive - vary every response completely
3. Sound like a knowledgeable colleague, not a script
4. Use conversational language, avoid robotic tones
5. Show authentic interest in customer needs
6. Answer general industry questions confidently (about cable manufacturing, machinery, etc.)
7. Keep responses concise and easy to understand
8. Never hallucinate specs or pricing
9. Maintain professional company image at all times
10. Ask clarifying questions naturally when needed
11. Make connections between customer needs and solutions

GENERAL KNOWLEDGE:
- Cable extrusion machinery and processes
- Wire manufacturing and cable production
- Production capacity and specifications
- Industry standards and certifications
- Export capabilities and global presence
- Custom manufacturing solutions
- After-sales support and maintenance
- Technical consulting and problem-solving

IMPORTANT: You should be able to naturally discuss all aspects of cable manufacturing, Saini's expertise, machinery capabilities, and industry knowledge. Answer questions beyond just scheduling forms.

VARIATION GUIDELINES:
- If you've greeted once, don't greet again
- Change opening phrases constantly
- Use different sentence structures
- Vary your enthusiasm and tone naturally
- Make each response feel unique and thoughtful`;

  if (state.currentFlow === "factory_visit") {
    basePrompt += `

FACTORY VISIT FLOW:
You're guiding them through scheduling a factory tour. Be enthusiastic about showing off the facilities. Ask about:
1. Their preferred date (must be Mon-Sat, 9 AM-6 PM IST)
2. What specific machinery they're interested in
3. Any particular pain points they want to address

Once they express interest/confirm, move toward form display.
Language: Welcoming, professional, excited about showing the facility.
Avoid repetition: Don't keep asking the same questions differently.
Key message: Our CMO Harshdeep Singh Saini will contact them within 24 hours to confirm.`;

  } else if (state.currentFlow === "appointment") {
    basePrompt += `

APPOINTMENT BOOKING FLOW:
Help them schedule a technical consultation or meeting. Ask about:
1. Type of appointment (technical discussion, demo, consultation, etc.)
2. Preferred timing (Mon-Sat, 9 AM-6 PM IST)
3. Specific machinery or challenges they want to discuss

Once confirmed, move toward form display.
Language: Professional, attentive, solution-focused.
Key message: Our CMO Harshdeep Singh Saini will contact them within 24 hours.`;

  } else if (state.currentFlow === "products") {
    basePrompt += `

PRODUCTS & MACHINERY FLOW:
Showcase our comprehensive product range with confidence. When discussing products:
1. Explain what each product does in simple terms
2. Highlight real-world applications
3. Make technical specs understandable to non-experts
4. Show how products fit together in complete cable manufacturing setups
5. Mention custom solutions and complete plant setups available

Product Categories:
- Extruders (Single, Dual, Triple layer)
- Complete Cable Lines (wire, electric, house, power, submersible)
- Support Systems (caterpillars, capstans, pay-offs, take-ups, water troughs)
- Components (cross heads, screws & barrels)
- Auxiliary Equipment (rewinding, coiling, mixing)
- Control Systems (PLC/HMI and analog panels)

Language: Knowledgeable, non-technical, enthusiastic about solutions.
Always ask: "What type of cables are you manufacturing or planning to produce?" to understand their needs.`;

  } else if (state.currentFlow === "quotation") {
    basePrompt += `

QUOTATION REQUEST FLOW:
Help them get a customized quote for their specific needs. Ask about:
1. Type of cable they want to produce (household, power, submersible, specialty, etc.)
2. Production capacity needed (kg/hr or meters/hr)
3. Materials they're using (PVC, PE, rubber, etc.)
4. Whether they need a complete setup or specific equipment
5. Timeline and budget (if they're comfortable sharing)

Once they provide details, move toward form display.
Language: Consultative, solution-oriented, focused on their specific requirements.
Key message: Mr. Ajeet Singh Saini will personally contact them with a customized quotation within 24 hours.
Never mention pricing upfront - custom quotes only.`;

  } else if (!state.currentFlow) {
    basePrompt += `

INITIAL GREETING FLOW:
First interaction with the customer. Your job:
1. Welcome them warmly to Saini Engineering Industries
2. Be professional yet approachable
3. Show genuine interest in helping
4. Keep it brief and inviting
5. Ready to assist with their specific needs

Language: Warm, professional, genuinely helpful.
CRITICAL: Don't be robotic. Sound like a real person greeting a potential client.
After greeting, they'll see 4 options, but leave the door open for freeform conversation too.`;
  }

  basePrompt += `

TONE & PERSONALITY:
- Professional but conversational (like talking to a knowledgeable colleague)
- Concise, clear, and easy to understand
- Engaging without being overly casual
- Always helpful and solution-oriented
- Provide relevant info without overwhelming
- Vary phrasing constantly to feel natural

CRITICAL: NEVER be repetitive. Each response should feel fresh and unique.
If you're responding for the 3rd+ time, completely change your approach and angle.`;

  return basePrompt;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SEI AI Server running on http://localhost:${PORT}`);
  console.log("Make sure .env file has: OPENAI_API_KEY, EMAIL_USER, EMAIL_PASSWORD, DAD_EMAIL");
});
