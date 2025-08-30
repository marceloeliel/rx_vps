// Script para cadastrar 15 veículos fake no Supabase
// Execute: node cadastrar-veiculos-supabase.js

// Importar dotenv para carregar variáveis de ambiente
require('dotenv').config();

// Importar Supabase (versão Node.js)
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase (usando as mesmas do projeto)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecdmpndeunbzhaihabvi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM';

console.log('🔧 Configurações do Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 50) + '...');

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Lista dos 15 veículos fake
const veiculos = [
  {
    marca_nome: "Chevrolet",
    modelo_nome: "Onix",
    titulo: "Chevrolet Onix 1.0 LT Flex Manual",
    descricao: "Veículo em excelente estado de conservação, revisões em dia, único dono.",
    ano_fabricacao: 2022,
    ano_modelo: 2023,
    quilometragem: 25000,
    preco: 65000,
    tipo_preco: "Negociável",
    cor: "Branco",
    combustivel: "Flex",
    cambio: "Manual",
    portas: 4,
    final_placa: "5",
    estado_veiculo: "Usado",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: false,
    aceita_financiamento: true,
    aceita_troca: true,
    aceita_parcelamento: true,
    parcelas_maximas: 60,
    entrada_minima: 15000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2022/03/15174829/chevrolet-onix-2022-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2022/03/15174829/chevrolet-onix-2022-732x488.jpg"]
  },
  {
    marca_nome: "Fiat",
    modelo_nome: "Strada",
    titulo: "Fiat Strada Endurance 1.4 Flex CD",
    descricao: "Picape robusta, ideal para trabalho e lazer. Cabine dupla com ar condicionado.",
    ano_fabricacao: 2021,
    ano_modelo: 2022,
    quilometragem: 35000,
    preco: 78000,
    tipo_preco: "Fixo",
    cor: "Prata",
    combustivel: "Flex",
    cambio: "Manual",
    portas: 4,
    final_placa: "8",
    estado_veiculo: "Usado",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: false,
    aceita_financiamento: true,
    aceita_troca: false,
    aceita_parcelamento: true,
    parcelas_maximas: 48,
    entrada_minima: 20000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2021/05/12174829/fiat-strada-2021-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2021/05/12174829/fiat-strada-2021-732x488.jpg"]
  },
  {
    marca_nome: "Hyundai",
    modelo_nome: "HB20",
    titulo: "Hyundai HB20 1.6 Comfort Plus Automático",
    descricao: "Hatch compacto com câmbio automático, ar digital e central multimídia.",
    ano_fabricacao: 2020,
    ano_modelo: 2021,
    quilometragem: 42000,
    preco: 72000,
    tipo_preco: "Negociável",
    cor: "Azul",
    combustivel: "Flex",
    cambio: "Automático",
    portas: 4,
    final_placa: "2",
    estado_veiculo: "Usado",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: false,
    aceita_financiamento: true,
    aceita_troca: true,
    aceita_parcelamento: true,
    parcelas_maximas: 60,
    entrada_minima: 18000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2020/08/28145834/hyundai-hb20-2020-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2020/08/28145834/hyundai-hb20-2020-732x488.jpg"]
  },
  {
    marca_nome: "Volkswagen",
    modelo_nome: "T-Cross",
    titulo: "Volkswagen T-Cross 1.0 TSI Comfortline",
    descricao: "SUV compacto turbo, econômico e espaçoso. Ideal para família.",
    ano_fabricacao: 2021,
    ano_modelo: 2022,
    quilometragem: 28000,
    preco: 95000,
    tipo_preco: "Fixo",
    cor: "Cinza",
    combustivel: "Flex",
    cambio: "Automático",
    portas: 4,
    final_placa: "7",
    estado_veiculo: "Usado",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: false,
    aceita_financiamento: true,
    aceita_troca: true,
    aceita_parcelamento: true,
    parcelas_maximas: 72,
    entrada_minima: 25000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2021/03/15174829/volkswagen-t-cross-2021-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2021/03/15174829/volkswagen-t-cross-2021-732x488.jpg"]
  },
  {
    marca_nome: "Jeep",
    modelo_nome: "Compass",
    titulo: "Jeep Compass 2.0 Sport Automático 4x2",
    descricao: "SUV robusto com design moderno e tecnologia avançada.",
    ano_fabricacao: 2020,
    ano_modelo: 2021,
    quilometragem: 38000,
    preco: 125000,
    tipo_preco: "Negociável",
    cor: "Preto",
    combustivel: "Flex",
    cambio: "Automático",
    portas: 4,
    final_placa: "1",
    estado_veiculo: "Usado",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: false,
    aceita_financiamento: true,
    aceita_troca: false,
    aceita_parcelamento: true,
    parcelas_maximas: 60,
    entrada_minima: 35000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2020/06/15174829/jeep-compass-2020-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2020/06/15174829/jeep-compass-2020-732x488.jpg"]
  },
  {
    marca_nome: "Fiat",
    modelo_nome: "Toro",
    titulo: "Fiat Toro 2.0 Diesel Freedom AT9 4x4",
    descricao: "Picape média com tração 4x4, motor diesel e câmbio automático de 9 marchas.",
    ano_fabricacao: 2021,
    ano_modelo: 2022,
    quilometragem: 32000,
    preco: 145000,
    tipo_preco: "Fixo",
    cor: "Vermelho",
    combustivel: "Diesel",
    cambio: "Automático",
    portas: 4,
    final_placa: "9",
    estado_veiculo: "Usado",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: false,
    aceita_financiamento: true,
    aceita_troca: true,
    aceita_parcelamento: true,
    parcelas_maximas: 72,
    entrada_minima: 40000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2021/04/15174829/fiat-toro-2021-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2021/04/15174829/fiat-toro-2021-732x488.jpg"]
  },
  {
    marca_nome: "BMW",
    modelo_nome: "X1",
    titulo: "BMW X1 sDrive20i GP ActiveFlex",
    descricao: "SUV premium com motor turbo, interior em couro e tecnologia BMW ConnectedDrive.",
    ano_fabricacao: 2022,
    ano_modelo: 2023,
    quilometragem: 15000,
    preco: 285000,
    tipo_preco: "Fixo",
    cor: "Branco",
    combustivel: "Flex",
    cambio: "Automático",
    portas: 4,
    final_placa: "3",
    estado_veiculo: "Seminovo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: true,
    aceita_financiamento: true,
    aceita_troca: false,
    aceita_parcelamento: true,
    parcelas_maximas: 60,
    entrada_minima: 85000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2022/07/15174829/bmw-x1-2022-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2022/07/15174829/bmw-x1-2022-732x488.jpg"]
  },
  {
    marca_nome: "BMW",
    modelo_nome: "Série 3",
    titulo: "BMW 320i 2.0 Sport GP ActiveFlex",
    descricao: "Sedan esportivo de luxo com motor turbo e acabamento premium.",
    ano_fabricacao: 2021,
    ano_modelo: 2022,
    quilometragem: 22000,
    preco: 320000,
    tipo_preco: "Negociável",
    cor: "Azul",
    combustivel: "Flex",
    cambio: "Automático",
    portas: 4,
    final_placa: "6",
    estado_veiculo: "Seminovo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: true,
    aceita_financiamento: true,
    aceita_troca: true,
    aceita_parcelamento: true,
    parcelas_maximas: 48,
    entrada_minima: 100000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2021/09/15174829/bmw-serie-3-2021-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2021/09/15174829/bmw-serie-3-2021-732x488.jpg"]
  },
  {
    marca_nome: "Volvo",
    modelo_nome: "EX30",
    titulo: "Volvo EX30 Single Motor Extended Range",
    descricao: "SUV elétrico compacto com autonomia estendida e tecnologia sustentável.",
    ano_fabricacao: 2024,
    ano_modelo: 2024,
    quilometragem: 5000,
    preco: 450000,
    tipo_preco: "Fixo",
    cor: "Cinza",
    combustivel: "Elétrico",
    cambio: "Automático",
    portas: 4,
    final_placa: "0",
    estado_veiculo: "Novo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: true,
    aceita_financiamento: true,
    aceita_troca: false,
    aceita_parcelamento: true,
    parcelas_maximas: 60,
    entrada_minima: 150000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2024/01/15174829/volvo-ex30-2024-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2024/01/15174829/volvo-ex30-2024-732x488.jpg"]
  },
  {
    marca_nome: "Land Rover",
    modelo_nome: "Range Rover",
    titulo: "Range Rover Evoque 2.0 HSE Dynamic",
    descricao: "SUV de luxo com design icônico e capacidades off-road excepcionais.",
    ano_fabricacao: 2023,
    ano_modelo: 2024,
    quilometragem: 8000,
    preco: 650000,
    tipo_preco: "Fixo",
    cor: "Preto",
    combustivel: "Gasolina",
    cambio: "Automático",
    portas: 4,
    final_placa: "4",
    estado_veiculo: "Seminovo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: true,
    aceita_financiamento: true,
    aceita_troca: true,
    aceita_parcelamento: true,
    parcelas_maximas: 48,
    entrada_minima: 200000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2023/05/15174829/range-rover-evoque-2023-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2023/05/15174829/range-rover-evoque-2023-732x488.jpg"]
  },
  {
    marca_nome: "Mercedes-Benz",
    modelo_nome: "Classe S",
    titulo: "Mercedes-Benz S 500 4MATIC",
    descricao: "Sedan de luxo máximo com tecnologia autônoma e conforto incomparável.",
    ano_fabricacao: 2023,
    ano_modelo: 2024,
    quilometragem: 3000,
    preco: 1200000,
    tipo_preco: "Fixo",
    cor: "Prata",
    combustivel: "Gasolina",
    cambio: "Automático",
    portas: 4,
    final_placa: "7",
    estado_veiculo: "Novo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: true,
    aceita_financiamento: true,
    aceita_troca: false,
    aceita_parcelamento: true,
    parcelas_maximas: 36,
    entrada_minima: 400000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2023/08/15174829/mercedes-classe-s-2023-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2023/08/15174829/mercedes-classe-s-2023-732x488.jpg"]
  },
  {
    marca_nome: "Porsche",
    modelo_nome: "911 Carrera",
    titulo: "Porsche 911 Carrera S Coupé",
    descricao: "Esportivo icônico com motor boxer e performance excepcional.",
    ano_fabricacao: 2023,
    ano_modelo: 2024,
    quilometragem: 2500,
    preco: 1800000,
    tipo_preco: "Fixo",
    cor: "Amarelo",
    combustivel: "Gasolina",
    cambio: "Automático",
    portas: 2,
    final_placa: "1",
    estado_veiculo: "Novo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: true,
    aceita_financiamento: true,
    aceita_troca: true,
    aceita_parcelamento: true,
    parcelas_maximas: 24,
    entrada_minima: 600000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2023/06/15174829/porsche-911-carrera-2023-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2023/06/15174829/porsche-911-carrera-2023-732x488.jpg"]
  },
  {
    marca_nome: "Ferrari",
    modelo_nome: "Purosangue",
    titulo: "Ferrari Purosangue V12",
    descricao: "SUV Ferrari com motor V12 naturalmente aspirado e design exclusivo.",
    ano_fabricacao: 2024,
    ano_modelo: 2024,
    quilometragem: 500,
    preco: 4500000,
    tipo_preco: "Fixo",
    cor: "Vermelho",
    combustivel: "Gasolina",
    cambio: "Automático",
    portas: 4,
    final_placa: "8",
    estado_veiculo: "Novo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: true,
    aceita_financiamento: false,
    aceita_troca: false,
    aceita_parcelamento: false,
    parcelas_maximas: 0,
    entrada_minima: 4500000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2024/02/15174829/ferrari-purosangue-2024-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2024/02/15174829/ferrari-purosangue-2024-732x488.jpg"]
  },
  {
    marca_nome: "Rolls-Royce",
    modelo_nome: "Cullinan",
    titulo: "Rolls-Royce Cullinan Black Badge",
    descricao: "SUV de ultra luxo com acabamento artesanal e motor V12 twin-turbo.",
    ano_fabricacao: 2024,
    ano_modelo: 2024,
    quilometragem: 200,
    preco: 6000000,
    tipo_preco: "A combinar",
    cor: "Preto",
    combustivel: "Gasolina",
    cambio: "Automático",
    portas: 4,
    final_placa: "9",
    estado_veiculo: "Novo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: true,
    aceita_financiamento: false,
    aceita_troca: false,
    aceita_parcelamento: false,
    parcelas_maximas: 0,
    entrada_minima: 6000000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2024/03/15174829/rolls-royce-cullinan-2024-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2024/03/15174829/rolls-royce-cullinan-2024-732x488.jpg"]
  },
  {
    marca_nome: "Chevrolet",
    modelo_nome: "Tracker",
    titulo: "Chevrolet Tracker 1.0 Turbo Premier",
    descricao: "SUV compacto turbo com tecnologia OnStar e design moderno.",
    ano_fabricacao: 2022,
    ano_modelo: 2023,
    quilometragem: 18000,
    preco: 115000,
    tipo_preco: "Negociável",
    cor: "Branco",
    combustivel: "Flex",
    cambio: "Automático",
    portas: 4,
    final_placa: "5",
    estado_veiculo: "Seminovo",
    tipo_veiculo: "carro",
    status: "indisponivel",
    destaque: false,
    aceita_financiamento: true,
    aceita_troca: true,
    aceita_parcelamento: true,
    parcelas_maximas: 60,
    entrada_minima: 30000,
    foto_principal: "https://cdn.autopapo.com.br/box/uploads/2022/04/15174829/chevrolet-tracker-2022-732x488.jpg",
    fotos: ["https://cdn.autopapo.com.br/box/uploads/2022/04/15174829/chevrolet-tracker-2022-732x488.jpg"]
  }
];

async function buscarUserIdPorEmail(email) {
  console.log(`🔍 Buscando user_id para o email: ${email}`);
  
  try {
    // Primeiro, buscar na tabela profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .eq('email', email);

    if (profileError) {
      console.error('❌ Erro ao buscar profiles:', profileError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profile encontrado:', profiles[0]);
      return profiles[0].user_id || profiles[0].id;
    }

    // Se não encontrou no profiles, buscar na tabela dados_agencia
    const { data: agencias, error: agenciaError } = await supabase
      .from('dados_agencia')
      .select('user_id, email')
      .eq('email', email);

    if (agenciaError) {
      console.error('❌ Erro ao buscar agências:', agenciaError);
    } else if (agencias && agencias.length > 0) {
      console.log('✅ Agência encontrada:', agencias[0]);
      return agencias[0].user_id;
    }

    console.log('❌ Nenhum usuário encontrado com o email:', email);
    return null;
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return null;
  }
}

async function testarConexaoSupabase() {
  console.log('🧪 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK!');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado na conexão:', error);
    return false;
  }
}

async function cadastrarVeiculos() {
  console.log('🚀 Iniciando cadastro de 15 veículos fake...\n');

  // Testar conexão primeiro
  const conexaoOK = await testarConexaoSupabase();
  if (!conexaoOK) {
    console.error('❌ Não foi possível conectar ao Supabase. Verifique as credenciais.');
    return;
  }

  // Buscar o user_id da agência
  const userId = await buscarUserIdPorEmail('rxnegocio@yahoo.com');
  
  if (!userId) {
    console.error('❌ Não foi possível encontrar o user_id para rxnegocio@yahoo.com');
    console.log('💡 Verifique se o email está correto na base de dados');
    return;
  }

  console.log(`✅ User ID encontrado: ${userId}\n`);

  let sucessos = 0;
  let erros = 0;

  for (let i = 0; i < veiculos.length; i++) {
    const veiculo = veiculos[i];
    
    console.log(`📝 Cadastrando veículo ${i + 1}/15: ${veiculo.marca_nome} ${veiculo.modelo_nome}`);

    try {
      const veiculoData = {
        ...veiculo,
        user_id: userId,
        profile_id: userId, // Assumindo que profile_id é igual ao user_id
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('veiculos')
        .insert([veiculoData])
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao cadastrar ${veiculo.marca_nome} ${veiculo.modelo_nome}:`, error);
        erros++;
      } else {
        console.log(`✅ ${veiculo.marca_nome} ${veiculo.modelo_nome} cadastrado com sucesso! ID: ${data.id}`);
        sucessos++;
      }
    } catch (error) {
      console.error(`❌ Erro inesperado ao cadastrar ${veiculo.marca_nome} ${veiculo.modelo_nome}:`, error);
      erros++;
    }

    // Pequena pausa entre os cadastros
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 CADASTRO CONCLUÍDO!');
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Erros: ${erros}`);
  console.log(`📊 Total: ${sucessos + erros}/15`);
  
  if (sucessos > 0) {
    console.log('\n📋 RESUMO DOS VEÍCULOS CADASTRADOS:');
    console.log('- Todos com status "indisponivel"');
    console.log('- Associados à agência rxnegocio@yahoo.com');
    console.log('- Preços variando de R$ 65.000 a R$ 6.000.000');
    console.log('- Marcas: Chevrolet, Fiat, Hyundai, VW, Jeep, BMW, Volvo, Range Rover, Mercedes, Porsche, Ferrari, Rolls-Royce');
  }
}

// Executar o script
cadastrarVeiculos().catch(console.error);





