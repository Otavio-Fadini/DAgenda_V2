import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Cadastro.css'; // Vamos criar este arquivo abaixo

function CadastroPaciente() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        cpf: '',
        telefone: ''
    });
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/cadastro-paciente', formData);
            alert('Cadastro realizado com sucesso!');
            navigate('/login');
        } catch (err) {
            setErro(err.response?.data?.error || 'Erro ao realizar cadastro.');
        }
    };

    return (
        <div className="cadastro-container">
            {/* Lado Esquerdo - Branding (Fundo escuro/Industrial) */}
            <div className="cadastro-banner">
                <div className="banner-content">
                    <h1>DAGENDA</h1>
                    <p>Agendamento inteligente e gestão de ponta para a sua saúde.</p>
                </div>
            </div>

            {/* Lado Direito - Formulário (Fundo claro/Minimalista) */}
            <div className="cadastro-form-section">
                <div className="form-wrapper">
                    <h2>Crie sua conta</h2>
                    <p className="subtitle">Preencha seus dados para começar a agendar suas consultas.</p>

                    {erro && <div className="alerta-erro">{erro}</div>}

                    <form onSubmit={handleSubmit} className="form-moderno">
                        <div className="input-group">
                            <label htmlFor="nome">Nome Completo</label>
                            <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Ex: João da Silva" />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="seu@email.com" />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label htmlFor="cpf">CPF</label>
                                <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" />
                            </div>
                            <div className="input-group">
                                <label htmlFor="telefone">Telefone</label>
                                <input type="text" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} required placeholder="(11) 90000-0000" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="senha">Senha</label>
                            <input type="password" id="senha" name="senha" value={formData.senha} onChange={handleChange} required placeholder="Crie uma senha forte" />
                        </div>

                        <button type="submit" className="btn-primario">Cadastrar</button>
                    </form>

                    <div className="form-footer">
                        <p>Já possui uma conta? <Link to="/login" className="link-destaque">Faça login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CadastroPaciente;