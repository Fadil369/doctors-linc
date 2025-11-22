#!/bin/bash
# Example: Process a medical prescription through the pipeline

set -e

echo "🏥 Doctors-Linc Pipeline Example"
echo "================================="
echo ""

# Check if example image exists
if [ ! -f "./examples/sample-prescription.txt" ]; then
    echo "Creating example data..."
    mkdir -p examples
    
    cat > examples/sample-prescription.txt << 'EOF'
MEDICAL PRESCRIPTION

Patient Name: Ahmed Hassan
Patient ID: SD-123456789
Date of Birth: 15/03/1975
Date: 2024-01-20

DIAGNOSIS:
Type 2 Diabetes Mellitus (E11.9)
Hypertension (I10)

MEDICATIONS:

1. Metformin 500mg
   Route: PO (Oral)
   Frequency: BID (Twice daily)
   Duration: 30 days
   Instructions: Take with meals

2. Lisinopril 10mg
   Route: PO (Oral)
   Frequency: QD (Once daily)
   Duration: 30 days
   Instructions: Take in morning

3. Aspirin 81mg
   Route: PO (Oral)
   Frequency: QD (Once daily)
   Duration: 30 days
   Instructions: Take with food

FOLLOW-UP: 4 weeks

Dr. Sarah Ahmad, MD
License: MED-98765
Signature: [Signed]
EOF

    echo "✅ Created sample prescription text"
fi

echo "Step 1: Processing medical text with HEALTHCARELINC"
echo "---------------------------------------------------"

# Process with healthcare agent
npm run cli process examples/sample-prescription.txt \
    --context prescription \
    --output ./output/example

echo ""
echo "Step 2: View Results"
echo "--------------------"

if [ -f "./output/example/sample-prescription.md" ]; then
    echo "✅ Structured Markdown:"
    cat "./output/example/sample-prescription.md"
else
    echo "⚠️  Markdown file not found, check output directory"
fi

echo ""
echo "================================="
echo "✅ Example Complete!"
echo ""
echo "Output files saved to: ./output/example/"
echo ""
echo "Try these commands next:"
echo "  npm run cli health           # Check system health"
echo "  npm run cli config           # View configuration"
echo "  npm run dev                  # Start API server"
echo ""
