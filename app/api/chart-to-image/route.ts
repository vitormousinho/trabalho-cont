import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface ChartData {
  type?: 'line' | 'bar' | 'pie' | 'area';
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>;
  title?: string;
  width?: number;
  height?: number;
}

function generateSVGChart(data: ChartData): string {
  const width = data.width || 800;
  const height = data.height || 400;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(
    ...data.datasets.flatMap(d => d.data),
    1
  );
  const minValue = Math.min(
    ...data.datasets.flatMap(d => d.data),
    0
  );
  const range = maxValue - minValue || 1;

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Background
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Title
  if (data.title) {
    svg += `<text x="${width / 2}" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1f2937">${data.title}</text>`;
  }

  // Grid lines
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding + (chartHeight / gridLines) * i;
    const value = maxValue - (range / gridLines) * i;
    svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
    svg += `<text x="${padding - 10}" y="${y + 5}" font-family="Arial, sans-serif" font-size="12" text-anchor="end" fill="#6b7280">${value.toFixed(1)}</text>`;
  }

  // Labels axis
  data.labels.forEach((label, index) => {
    const x = padding + (chartWidth / (data.labels.length - 1 || 1)) * index;
    svg += `<text x="${x}" y="${height - padding + 20}" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#6b7280" transform="rotate(-45 ${x} ${height - padding + 20})">${label}</text>`;
  });

  // Draw datasets
  data.datasets.forEach((dataset, datasetIndex) => {
    const color = Array.isArray(dataset.backgroundColor)
      ? dataset.backgroundColor[0]
      : dataset.backgroundColor || colors[datasetIndex % colors.length];
    const borderColor = dataset.borderColor || color;

    if (data.type === 'line' || data.type === 'area') {
      // Line chart
      let path = '';
      let areaPath = '';
      
      dataset.data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.labels.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
        
        if (index === 0) {
          path = `M ${x} ${y}`;
          areaPath = `M ${x} ${height - padding} L ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
          areaPath += ` L ${x} ${y}`;
        }
      });

      // Fill area
      if (data.type === 'area') {
        areaPath += ` L ${padding + chartWidth} ${height - padding} Z`;
        svg += `<path d="${areaPath}" fill="${color}" opacity="0.3"/>`;
      }

      // Line
      svg += `<path d="${path}" stroke="${borderColor}" stroke-width="2" fill="none"/>`;
      
      // Points
      dataset.data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.labels.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
        svg += `<circle cx="${x}" cy="${y}" r="4" fill="${borderColor}"/>`;
      });
    } else if (data.type === 'bar') {
      // Bar chart
      const barWidth = chartWidth / data.labels.length / data.datasets.length * 0.8;
      const groupWidth = chartWidth / data.labels.length;
      
      dataset.data.forEach((value, index) => {
        const barHeight = ((value - minValue) / range) * chartHeight;
        const x = padding + index * groupWidth + (datasetIndex * barWidth) + (groupWidth / data.datasets.length / 2) - (barWidth / 2);
        const y = padding + chartHeight - barHeight;
        
        svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" stroke="${borderColor}" stroke-width="1"/>`;
      });
    } else if (data.type === 'pie') {
      // Pie chart
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
      
      const total = dataset.data.reduce((a, b) => a + b, 0);
      let currentAngle = -Math.PI / 2;
      
      dataset.data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        
        const color2 = Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor[index]
          : dataset.backgroundColor || colors[index % colors.length];
        
        svg += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${color2}" stroke="white" stroke-width="2"/>`;
        
        // Label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);
        const label = data.labels[index] || '';
        
        svg += `<text x="${labelX}" y="${labelY}" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white" font-weight="bold">${label}</text>`;
        
        currentAngle = endAngle;
      });
    }
  });

  svg += '</svg>';
  return svg;
}

export async function POST(request: NextRequest) {
  try {
    const data: ChartData = await request.json();

    if (!data.labels || !data.datasets) {
      return NextResponse.json(
        { error: 'Dados do gráfico inválidos. Campos obrigatórios: labels, datasets' },
        { status: 400 }
      );
    }

    const svg = generateSVGChart(data);
    
    // Converter SVG para base64 PNG usando uma abordagem simples
    // No Vercel, retornamos o SVG e o cliente pode converter se necessário
    // Ou podemos usar uma biblioteca como sharp, mas requer configuração adicional
    
    return NextResponse.json({
      svg: svg,
      dataUri: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      type: 'svg'
    });
  } catch (error) {
    console.error('Erro ao gerar gráfico:', error);
    return NextResponse.json(
      { error: 'Erro ao processar dados do gráfico' },
      { status: 500 }
    );
  }
}

